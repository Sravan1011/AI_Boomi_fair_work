// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FairWorkEscrow
 * @notice Main escrow contract for FairWork platform
 * @dev Handles job creation, deliverable submission, disputes, and fund distribution
 */
contract FairWorkEscrow is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    
    uint256 public jobCounter;
    uint256 public disputeCounter;
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5% in basis points
    uint256 public constant JUROR_COUNT = 3;
    
    enum JobStatus {
        OPEN,
        ACCEPTED,
        SUBMITTED,
        APPROVED,
        DISPUTED,
        RESOLVED,
        CANCELLED
    }
    
    enum DisputeStatus {
        ACTIVE,
        RESOLVED
    }
    
    struct Job {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        uint256 deadline;
        string descriptionHash; // IPFS hash
        string deliverableHash; // IPFS hash
        JobStatus status;
        uint256 createdAt;
    }
    
    struct Dispute {
        uint256 id;
        uint256 jobId;
        address raisedBy;
        string evidenceHash; // IPFS hash
        address[] jurors;
        mapping(address => bool) hasVoted;
        uint256 votesForClient;
        uint256 votesForFreelancer;
        DisputeStatus status;
        address winner;
        uint256 createdAt;
    }
    
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256) public jobToDispute; // jobId => disputeId
    
    // Jury pool (simplified for MVP - in production, this would be in JuryPool contract)
    address[] public juryPool;
    mapping(address => bool) public isJuror;
    
    // Events
    event JobCreated(uint256 indexed jobId, address indexed client, uint256 amount, uint256 deadline);
    event JobAccepted(uint256 indexed jobId, address indexed freelancer);
    event DeliverableSubmitted(uint256 indexed jobId, string deliverableHash);
    event JobApproved(uint256 indexed jobId);
    event DisputeRaised(uint256 indexed disputeId, uint256 indexed jobId, address indexed raisedBy);
    event JurorsSelected(uint256 indexed disputeId, address[] jurors);
    event VoteCast(uint256 indexed disputeId, address indexed juror, bool votedForClient);
    event DisputeResolved(uint256 indexed disputeId, address indexed winner);
    event FundsReleased(uint256 indexed jobId, address indexed recipient, uint256 amount);
    event JobCancelled(uint256 indexed jobId, address indexed client, uint256 refundAmount);

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }
    
    /**
     * @notice Create a new job and fund escrow
     * @param _amount USDC amount (with 6 decimals)
     * @param _deadline Unix timestamp deadline
     * @param _descriptionHash IPFS hash of job description
     */
    function createJob(
        uint256 _amount,
        uint256 _deadline,
        string calldata _descriptionHash
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(_amount > 0, "Amount must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(bytes(_descriptionHash).length > 0, "Description hash required");
        
        // Transfer USDC to escrow (SafeERC20 handles non-standard tokens)
        usdc.safeTransferFrom(msg.sender, address(this), _amount);
        
        uint256 jobId = jobCounter++;
        
        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: address(0),
            amount: _amount,
            deadline: _deadline,
            descriptionHash: _descriptionHash,
            deliverableHash: "",
            status: JobStatus.OPEN,
            createdAt: block.timestamp
        });
        
        emit JobCreated(jobId, msg.sender, _amount, _deadline);
        return jobId;
    }
    
    /**
     * @notice Freelancer accepts a job
     * @param _jobId Job ID to accept
     */
    function acceptJob(uint256 _jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.OPEN, "Job not open");
        require(job.client != msg.sender, "Client cannot accept own job");
        require(block.timestamp < job.deadline, "Job deadline passed");
        
        job.freelancer = msg.sender;
        job.status = JobStatus.ACCEPTED;
        
        emit JobAccepted(_jobId, msg.sender);
    }
    
    /**
     * @notice Freelancer submits deliverable
     * @param _jobId Job ID
     * @param _deliverableHash IPFS hash of deliverable
     */
    function submitDeliverable(
        uint256 _jobId,
        string calldata _deliverableHash
    ) external nonReentrant whenNotPaused {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.ACCEPTED, "Job not accepted");
        require(job.freelancer == msg.sender, "Only freelancer can submit");
        require(bytes(_deliverableHash).length > 0, "Deliverable hash required");
        
        job.deliverableHash = _deliverableHash;
        job.status = JobStatus.SUBMITTED;
        
        emit DeliverableSubmitted(_jobId, _deliverableHash);
    }
    
    /**
     * @notice Client approves deliverable and releases funds
     * @param _jobId Job ID to approve
     */
    function approveJob(uint256 _jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.SUBMITTED, "Job not submitted");
        require(job.client == msg.sender, "Only client can approve");
        
        job.status = JobStatus.APPROVED;
        
        // Calculate platform fee and freelancer payment
        uint256 platformFee = (job.amount * PLATFORM_FEE_BPS) / 10000;
        uint256 freelancerPayment = job.amount - platformFee;
        
        // Release funds (SafeERC20 handles non-standard tokens)
        usdc.safeTransfer(job.freelancer, freelancerPayment);
        usdc.safeTransfer(owner(), platformFee);
        
        emit JobApproved(_jobId);
        emit FundsReleased(_jobId, job.freelancer, freelancerPayment);
    }

    /**
     * @notice Client cancels job and receives full refund
     * @param _jobId Job ID to cancel
     */
    function cancelJob(uint256 _jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[_jobId];

        // Only client can cancel their own job
        require(job.client == msg.sender, "Only client can cancel");

        // Can only cancel jobs that haven't been accepted yet
        require(job.status == JobStatus.OPEN, "Can only cancel open jobs");

        // Update job status
        job.status = JobStatus.CANCELLED;

        // Full refund to client (100% - no cancellation fee for now)
        uint256 refundAmount = job.amount;

        // Transfer refund back to client (SafeERC20 handles non-standard tokens)
        usdc.safeTransfer(job.client, refundAmount);

        emit JobCancelled(_jobId, msg.sender, refundAmount);
        emit FundsReleased(_jobId, msg.sender, refundAmount);
    }

    /**
     * @notice Raise a dispute on a submitted job
     * @param _jobId Job ID to dispute
     * @param _evidenceHash IPFS hash of evidence
     */
    function raiseDispute(
        uint256 _jobId,
        string calldata _evidenceHash
    ) external nonReentrant whenNotPaused returns (uint256) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.SUBMITTED, "Job not submitted");
        require(
            msg.sender == job.client || msg.sender == job.freelancer,
            "Only parties can raise dispute"
        );
        require(bytes(_evidenceHash).length > 0, "Evidence hash required");
        
        job.status = JobStatus.DISPUTED;
        
        uint256 disputeId = disputeCounter++;
        Dispute storage dispute = disputes[disputeId];
        dispute.id = disputeId;
        dispute.jobId = _jobId;
        dispute.raisedBy = msg.sender;
        dispute.evidenceHash = _evidenceHash;
        dispute.status = DisputeStatus.ACTIVE;
        dispute.createdAt = block.timestamp;
        
        jobToDispute[_jobId] = disputeId;
        
        // Select 3 random jurors (simplified - in production use VRF)
        dispute.jurors = _selectJurors();
        
        emit DisputeRaised(disputeId, _jobId, msg.sender);
        emit JurorsSelected(disputeId, dispute.jurors);
        
        return disputeId;
    }
    
    /**
     * @notice Juror casts vote on dispute
     * @param _disputeId Dispute ID
     * @param _voteForClient True if voting for client, false for freelancer
     */
    function castVote(uint256 _disputeId, bool _voteForClient) external nonReentrant whenNotPaused {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.status == DisputeStatus.ACTIVE, "Dispute not active");
        require(_isJurorForDispute(_disputeId, msg.sender), "Not a juror for this dispute");
        require(!dispute.hasVoted[msg.sender], "Already voted");
        
        dispute.hasVoted[msg.sender] = true;
        
        if (_voteForClient) {
            dispute.votesForClient++;
        } else {
            dispute.votesForFreelancer++;
        }
        
        emit VoteCast(_disputeId, msg.sender, _voteForClient);
        
        // Check if voting is complete (all 3 jurors voted)
        if (dispute.votesForClient + dispute.votesForFreelancer == JUROR_COUNT) {
            _resolveDispute(_disputeId);
        }
    }
    
    /**
     * @notice Internal function to resolve dispute based on votes
     * @param _disputeId Dispute ID to resolve
     */
    function _resolveDispute(uint256 _disputeId) internal {
        Dispute storage dispute = disputes[_disputeId];
        Job storage job = jobs[dispute.jobId];
        
        dispute.status = DisputeStatus.RESOLVED;
        job.status = JobStatus.RESOLVED;
        
        // Determine winner (majority vote)
        address winner;
        if (dispute.votesForClient > dispute.votesForFreelancer) {
            winner = job.client;
        } else {
            winner = job.freelancer;
        }
        
        dispute.winner = winner;
        
        // Calculate payments
        uint256 platformFee = (job.amount * PLATFORM_FEE_BPS) / 10000;
        uint256 winnerPayment = job.amount - platformFee;
        
        // Release funds to winner (SafeERC20 handles non-standard tokens)
        usdc.safeTransfer(winner, winnerPayment);
        usdc.safeTransfer(owner(), platformFee);
        
        emit DisputeResolved(_disputeId, winner);
        emit FundsReleased(dispute.jobId, winner, winnerPayment);
    }
    
    /**
     * @notice Add juror to pool (simplified for MVP)
     * @param _juror Address to add as juror
     */
    function addJuror(address _juror) external onlyOwner {
        require(!isJuror[_juror], "Already a juror");
        juryPool.push(_juror);
        isJuror[_juror] = true;
    }
    
    /**
     * @notice Select 3 random jurors (simplified - use VRF in production)
     * @return Array of 3 juror addresses
     */
    function _selectJurors() internal view returns (address[] memory) {
        require(juryPool.length >= JUROR_COUNT, "Not enough jurors in pool");

        address[] memory selected = new address[](JUROR_COUNT);
        uint256 poolSize = juryPool.length;
        uint256 selectedCount = 0;

        // Simplified random selection (NOT secure for production)
        // In production, use Chainlink VRF
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao)));
        uint256 nonce = 0;

        while (selectedCount < JUROR_COUNT) {
            uint256 index = uint256(keccak256(abi.encodePacked(seed, nonce))) % poolSize;
            address candidate = juryPool[index];
            nonce++;

            // Check for duplicates
            bool isDuplicate = false;
            for (uint256 j = 0; j < selectedCount; j++) {
                if (selected[j] == candidate) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                selected[selectedCount] = candidate;
                selectedCount++;
            }
        }

        return selected;
    }
    
    /**
     * @notice Check if address is juror for specific dispute
     * @param _disputeId Dispute ID
     * @param _juror Address to check
     * @return True if address is juror for this dispute
     */
    function _isJurorForDispute(uint256 _disputeId, address _juror) internal view returns (bool) {
        Dispute storage dispute = disputes[_disputeId];
        for (uint256 i = 0; i < dispute.jurors.length; i++) {
            if (dispute.jurors[i] == _juror) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal function - only for recovering stuck funds
     * @dev Only owner can call this. Use with extreme caution.
     * @param _recipient Address to send the funds to
     * @param _amount Amount of USDC to withdraw (in USDC decimals - 6)
     */
    function emergencyWithdraw(address _recipient, uint256 _amount) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");

        uint256 contractBalance = usdc.balanceOf(address(this));
        require(_amount <= contractBalance, "Insufficient contract balance");

        // SafeERC20 handles non-standard tokens
        usdc.safeTransfer(_recipient, _amount);

        emit FundsReleased(0, _recipient, _amount);
    }

    /**
     * @notice Get job details
     * @param _jobId Job ID
     * @return Job struct
     */
    function getJob(uint256 _jobId) external view returns (Job memory) {
        return jobs[_jobId];
    }
    
    /**
     * @notice Get dispute jurors
     * @param _disputeId Dispute ID
     * @return Array of juror addresses
     */
    function getDisputeJurors(uint256 _disputeId) external view returns (address[] memory) {
        return disputes[_disputeId].jurors;
    }
    
    /**
     * @notice Get dispute vote counts
     * @param _disputeId Dispute ID
     * @return votesForClient, votesForFreelancer
     */
    function getDisputeVotes(uint256 _disputeId) external view returns (uint256, uint256) {
        Dispute storage dispute = disputes[_disputeId];
        return (dispute.votesForClient, dispute.votesForFreelancer);
    }
}
