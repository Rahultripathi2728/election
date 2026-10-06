import React from "react";
import { 
  Vote, 
  ShieldCheck, 
  Sliders, 
  BarChart3, 
  Cloud, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Radio
} from "lucide-react";
import { useElection } from "../context/ElectionContext";

export const Navbar = ({ activeView, setActiveView, onOpenFirebaseModal }) => {
  const { electionConfig, firebaseStatus, voters } = useElection();

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

  const boothState = electionConfig.boothState || {};
  const isBoothUnlocked = boothState.status === "UNLOCKED";
  const isBoothSubmitting = boothState.status === "SUBMITTING";

  const openInNewTab = (viewName) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", viewName);
    window.open(url.toString(), "_blank", "width=1200,height=800");
  };

  return (
    <header className="navbar-container">
      {/* Top Banner */}
      <div className="navbar-top">
        <div className="brand-group">
          <div className="brand-icon-box">
            <Vote size={26} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">E-VOTE CAMPUS</div>
            <div className="brand-subtitle">
              {electionConfig.institution} • {electionConfig.title}
            </div>
          </div>
        </div>

        {/* Global Status & Quick Controls */}
        <div className="navbar-telemetry">
          {/* EVM Booth Beacon */}
          <div className={`booth-beacon ${isBoothUnlocked ? "beacon-unlocked" : isBoothSubmitting ? "beacon-submitting" : "beacon-locked"}`}>
            <span className="beacon-dot"></span>
            <span className="beacon-text">
              {isBoothSubmitting ? (
                <>⏳ EVM Recording Vote...</>
              ) : isBoothUnlocked ? (
                <>
                  <Unlock size={14} /> EVM Unlocked: {boothState.authorizedVoter?.name?.split(" ")[0]}
                </>
              ) : (
                <>
                  <Lock size={14} /> EVM Booth Locked
                </>
              )}
            </span>
          </div>

          {/* Turnout Pill */}
          <div className="turnout-pill" title={`${votedCount} of ${totalVoters} voters voted`}>
            <Radio size={14} className="turnout-pulse" />
            <span>Turnout: <strong>{turnoutPercent}%</strong> ({votedCount}/{totalVoters})</span>
          </div>

          {/* Firebase Connection Indicator */}
          <button 
            onClick={onOpenFirebaseModal}
            className={`firebase-pill ${firebaseStatus.connected ? "fb-connected" : "fb-local"}`}
            title="Click to view or edit Firebase configuration"
          >
            <Cloud size={15} />
            <span>{firebaseStatus.connected ? "Firebase Live" : "Local Sync Mode"}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="navbar-nav">
        <div className="nav-tabs-wrapper">
          <button
            onClick={() => setActiveView("admin")}
            className={`nav-tab-btn ${activeView === "admin" ? "active" : ""}`}
          >
            <Sliders size={18} />
            <span>Admin Control Panel</span>
          </button>

          <button
            onClick={() => setActiveView("verify")}
            className={`nav-tab-btn ${activeView === "verify" ? "active" : ""}`}
          >
            <ShieldCheck size={18} />
            <span>Verification Desk</span>
            <span className="tab-pill-badge">Officer</span>
          </button>

          <button
            onClick={() => setActiveView("evm")}
            className={`nav-tab-btn ${activeView === "evm" ? "active" : ""}`}
          >
            <Vote size={18} />
            <span>EVM Voting Terminal</span>
            {isBoothUnlocked && <span className="tab-pill-alert">Ready to Vote</span>}
          </button>

          <button
            onClick={() => setActiveView("live")}
            className={`nav-tab-btn ${activeView === "live" ? "active" : ""}`}
          >
            <BarChart3 size={18} />
            <span>Live Results Screen</span>
            <span className="tab-pill-live">Realtime</span>
          </button>
        </div>

        {/* Multi-Window Launcher */}
        <div className="nav-actions">
          <button
            onClick={() => openInNewTab(activeView)}
            className="btn-launch-popout"
            title="Open current panel in a separate window to simulate multiple physical stations"
          >
            <ExternalLink size={15} />
            <span>Open in New Window</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
