// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FairWorkEscrow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Minimal ERC20 mock to simulate USDC in tests
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract FairWorkEscrowTest is Test {
    FairWorkEscrow public escrow;
    MockUSDC public usdc;

    address public owner = address(this);
    address public client = address(0x1);
    address public freelancer = address(0x2);
    address public juror1 = address(0x10);
    address public juror2 = address(0x11);
    address public juror3 = address(0x12);
    address public stranger = address(0x99);

    uint256 public constant JOB_AMOUNT = 1000e6; // 1000 USDC
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%

    function setUp() public {
        usdc = new MockUSDC();
        escrow = new FairWorkEscrow(address(usdc));

        // Fund client
        usdc.mint(client, 10_000e6);
        vm.prank(client);
        usdc.approve(address(escrow), type(uint256).max);

        // Register 3 jurors in the pool
        escrow.addJuror(juror1);
        escrow.addJuror(juror2);
        escrow.addJuror(juror3);
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    function _createJob() internal returns (uint256 jobId) {
        vm.prank(client);
        jobId = escrow.createJob(JOB_AMOUNT, block.timestamp + 7 days, "ipfs://jobdesc");
    }

    function _acceptJob(uint256 jobId) internal {
        vm.prank(freelancer);
        escrow.acceptJob(jobId);
    }

    function _submitDeliverable(uint256 jobId) internal {
        vm.prank(freelancer);
        escrow.submitDeliverable(jobId, "ipfs://deliverable");
    }

    function _fullDispute(uint256 jobId) internal returns (uint256 disputeId) {
        vm.prank(client);
        disputeId = escrow.raiseDispute(jobId, "ipfs://evidence");
    }

    // ─────────────────────────────────────────────
    // TEST 1: Create Job
    // ─────────────────────────────────────────────

    function test_CreateJob_LocksUSDC() public {
        uint256 clientBefore = usdc.balanceOf(client);
        uint256 jobId = _createJob();

        assertEq(usdc.balanceOf(address(escrow)), JOB_AMOUNT, "Escrow should hold USDC");
        assertEq(usdc.balanceOf(client), clientBefore - JOB_AMOUNT, "Client balance reduced");
        assertEq(escrow.jobCounter(), 1, "Job counter incremented");

        FairWorkEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.client, client);
        assertEq(job.amount, JOB_AMOUNT);
        assertEq(uint8(job.status), uint8(0)); // OPEN = 0
    }

    function test_CreateJob_RevertZeroAmount() public {
        vm.prank(client);
        vm.expectRevert("Amount must be > 0");
        escrow.createJob(0, block.timestamp + 1 days, "ipfs://desc");
    }

    function test_CreateJob_RevertPastDeadline() public {
        vm.prank(client);
        vm.expectRevert("Deadline must be in future");
        escrow.createJob(JOB_AMOUNT, block.timestamp - 1, "ipfs://desc");
    }

    // ─────────────────────────────────────────────
    // TEST 2: Accept Job
    // ─────────────────────────────────────────────

    function test_AcceptJob_SetsFreelancer() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);

        FairWorkEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.freelancer, freelancer);
        assertEq(uint8(job.status), uint8(1)); // ACCEPTED = 1
    }

    function test_AcceptJob_RevertClientCantAcceptOwn() public {
        uint256 jobId = _createJob();
        vm.prank(client);
        vm.expectRevert("Client cannot accept own job");
        escrow.acceptJob(jobId);
    }

    function test_AcceptJob_RevertAlreadyAccepted() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        vm.prank(stranger);
        vm.expectRevert("Job not open");
        escrow.acceptJob(jobId);
    }

    // ─────────────────────────────────────────────
    // TEST 3: Submit Deliverable
    // ─────────────────────────────────────────────

    function test_SubmitDeliverable_UpdatesStatus() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);

        FairWorkEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.deliverableHash, "ipfs://deliverable");
        assertEq(uint8(job.status), uint8(2)); // SUBMITTED = 2
    }

    function test_SubmitDeliverable_RevertNonFreelancer() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        vm.prank(stranger);
        vm.expectRevert("Only freelancer can submit");
        escrow.submitDeliverable(jobId, "ipfs://deliverable");
    }

    // ─────────────────────────────────────────────
    // TEST 4: Approve Job (happy path)
    // ─────────────────────────────────────────────

    function test_ApproveJob_ReleasesFunds() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);

        uint256 freelancerBefore = usdc.balanceOf(freelancer);
        uint256 ownerBefore = usdc.balanceOf(owner);

        vm.prank(client);
        escrow.approveJob(jobId);

        uint256 expectedFee = (JOB_AMOUNT * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedPayout = JOB_AMOUNT - expectedFee;

        assertEq(usdc.balanceOf(freelancer), freelancerBefore + expectedPayout, "Freelancer gets 97.5%");
        assertEq(usdc.balanceOf(owner), ownerBefore + expectedFee, "Owner gets 2.5% fee");
        assertEq(usdc.balanceOf(address(escrow)), 0, "Escrow emptied");
    }

    function test_ApproveJob_RevertNonClient() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);
        vm.prank(stranger);
        vm.expectRevert("Only client can approve");
        escrow.approveJob(jobId);
    }

    // ─────────────────────────────────────────────
    // TEST 5: Cancel Job
    // ─────────────────────────────────────────────

    function test_CancelJob_RefundsClient() public {
        uint256 jobId = _createJob();
        uint256 clientBefore = usdc.balanceOf(client);

        vm.prank(client);
        escrow.cancelJob(jobId);

        assertEq(usdc.balanceOf(client), clientBefore + JOB_AMOUNT, "Client fully refunded");
        assertEq(usdc.balanceOf(address(escrow)), 0, "Escrow emptied");

        FairWorkEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(uint8(job.status), uint8(6)); // CANCELLED = 6
    }

    function test_CancelJob_RevertAfterAccepted() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        vm.prank(client);
        vm.expectRevert("Can only cancel open jobs");
        escrow.cancelJob(jobId);
    }

    function test_CancelJob_RevertNonClient() public {
        uint256 jobId = _createJob();
        vm.prank(stranger);
        vm.expectRevert("Only client can cancel");
        escrow.cancelJob(jobId);
    }

    // ─────────────────────────────────────────────
    // TEST 6: Raise Dispute
    // ─────────────────────────────────────────────

    function test_RaiseDispute_SelectsThreeJurors() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);
        uint256 disputeId = _fullDispute(jobId);

        address[] memory jurors = escrow.getDisputeJurors(disputeId);
        assertEq(jurors.length, 3, "Exactly 3 jurors selected");
        // All must be from the registered pool
        for (uint256 i = 0; i < jurors.length; i++) {
            assertTrue(escrow.isJuror(jurors[i]), "Juror must be registered");
        }
    }

    function test_RaiseDispute_RevertByStranger() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);
        vm.prank(stranger);
        vm.expectRevert("Only parties can raise dispute");
        escrow.raiseDispute(jobId, "ipfs://evidence");
    }

    // ─────────────────────────────────────────────
    // TEST 7: Jury Voting
    // ─────────────────────────────────────────────

    function test_CastVote_ClientWins() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);
        uint256 disputeId = _fullDispute(jobId);

        address[] memory jurors = escrow.getDisputeJurors(disputeId);
        uint256 clientBefore = usdc.balanceOf(client);

        // All 3 jurors vote for client
        vm.prank(jurors[0]); escrow.castVote(disputeId, true);
        vm.prank(jurors[1]); escrow.castVote(disputeId, true);
        vm.prank(jurors[2]); escrow.castVote(disputeId, true);

        uint256 expectedFee = (JOB_AMOUNT * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedPayout = JOB_AMOUNT - expectedFee;
        assertEq(usdc.balanceOf(client), clientBefore + expectedPayout, "Client wins and gets funds");
        assertEq(usdc.balanceOf(address(escrow)), 0, "Escrow emptied after resolution");
    }

    function test_CastVote_FreelancerWins() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);
        uint256 disputeId = _fullDispute(jobId);

        address[] memory jurors = escrow.getDisputeJurors(disputeId);
        uint256 freelancerBefore = usdc.balanceOf(freelancer);

        // 2 out of 3 vote for freelancer
        vm.prank(jurors[0]); escrow.castVote(disputeId, false);
        vm.prank(jurors[1]); escrow.castVote(disputeId, false);
        vm.prank(jurors[2]); escrow.castVote(disputeId, true);

        uint256 expectedFee = (JOB_AMOUNT * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedPayout = JOB_AMOUNT - expectedFee;
        assertEq(usdc.balanceOf(freelancer), freelancerBefore + expectedPayout, "Freelancer wins and gets funds");
    }

    function test_CastVote_RevertDoubleVote() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);
        uint256 disputeId = _fullDispute(jobId);

        address[] memory jurors = escrow.getDisputeJurors(disputeId);
        vm.prank(jurors[0]); escrow.castVote(disputeId, true);
        vm.prank(jurors[0]);
        vm.expectRevert("Already voted");
        escrow.castVote(disputeId, true);
    }

    function test_CastVote_RevertNonJuror() public {
        uint256 jobId = _createJob();
        _acceptJob(jobId);
        _submitDeliverable(jobId);
        uint256 disputeId = _fullDispute(jobId);

        vm.prank(stranger);
        vm.expectRevert("Not a juror for this dispute");
        escrow.castVote(disputeId, true);
    }

    // ─────────────────────────────────────────────
    // TEST 8: Access Control
    // ─────────────────────────────────────────────

    function test_AddJuror_RevertNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert();
        escrow.addJuror(address(0xAB));
    }

    function test_Pause_StopsJobCreation() public {
        escrow.pause();
        vm.prank(client);
        vm.expectRevert();
        escrow.createJob(JOB_AMOUNT, block.timestamp + 1 days, "ipfs://desc");
    }

    function test_Unpause_ResumesJobCreation() public {
        escrow.pause();
        escrow.unpause();
        uint256 jobId = _createJob();
        assertEq(escrow.jobCounter(), 1);
        assertEq(escrow.getJob(jobId).client, client);
    }

    function test_EmergencyWithdraw_OnlyOwner() public {
        _createJob(); // put funds in escrow
        vm.prank(stranger);
        vm.expectRevert();
        escrow.emergencyWithdraw(stranger, JOB_AMOUNT);
    }
}
