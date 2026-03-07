import Link from "next/link";

export default function Footer() {
    return (
        <footer className="footer" role="contentinfo">
            <div className="container-custom">
                <div className="grid md:grid-cols-4 gap-12 mb-0">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="footer-logo">
                            <span style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                            }}>
                                <span style={{
                                    width: 32, height: 32,
                                    borderRadius: 9,
                                    background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    fontWeight: 800,
                                    color: "white",
                                }}>FW</span>
                                FairWork
                            </span>
                        </div>
                        <p className="footer-tagline">
                            The fairest freelance platform. Built on Polygon, powered by AI.
                        </p>

                        {/* Network badge */}
                        <div style={{
                            marginTop: 20,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "6px 14px",
                            border: "1px solid var(--border)",
                            borderRadius: 50,
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse-dot 2s infinite" }} />
                            Polygon Amoy Testnet
                        </div>
                    </div>

                    {/* Platform links */}
                    <div>
                        <p className="footer-heading">Platform</p>
                        <Link href="/jobs" className="footer-link">Browse Jobs</Link>
                        <Link href="/jobs/create" className="footer-link">Post a Job</Link>
                        <Link href="/disputes" className="footer-link">Dispute Center</Link>
                        <Link href="/dashboard" className="footer-link">My Dashboard</Link>
                    </div>

                    {/* Resources */}
                    <div>
                        <p className="footer-heading">Resources</p>
                        <a href="#" className="footer-link">How It Works</a>
                        <a href="#" className="footer-link">Smart Contracts</a>
                        <a href="#" className="footer-link">Documentation</a>
                        <a href="#" className="footer-link">API Reference</a>
                    </div>

                    {/* Built with */}
                    <div>
                        <p className="footer-heading">Built With</p>
                        <a href="https://polygon.technology" target="_blank" rel="noopener" className="footer-link">Polygon Network</a>
                        <a href="https://openai.com" target="_blank" rel="noopener" className="footer-link">OpenAI</a>
                        <a href="https://supabase.com" target="_blank" rel="noopener" className="footer-link">Supabase</a>
                        <a href="https://pinata.cloud" target="_blank" rel="noopener" className="footer-link">Pinata IPFS</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© 2025 FairWork. All rights reserved.</span>
                    <span style={{ color: "var(--text-subtle)", fontSize: "0.8rem" }}>
                        Made with ❤️ for the Web3 community
                    </span>
                </div>
            </div>
        </footer>
    );
}
