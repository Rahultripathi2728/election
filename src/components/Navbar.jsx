import React from "react";
import { 
  Vote, 
  ShieldCheck, 
  Sliders, 
  BarChart3, 
  Cloud, 
  Lock, 
  Unlock, 
  Radio,
  LogOut,
  UserCheck
} from "lucide-react";
import { useElection } from "../context/ElectionContext";

export const Navbar = ({ 
  userSession, 
  onLogout, 
  onOpenFirebaseModal 
}) => {
  const { electionConfig, firebaseStatus, voters, ballots, cancelBoothAuthorization } = useElection();

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

  const boothState = electionConfig.boothState || {};
  const isBoothUnlocked = boothState.status === "UNLOCKED";
  const isBoothSubmitting = boothState.status === "SUBMITTING";

  const getStationBadge = () => {
    switch (userSession?.role) {
      case "admin":
        return {
          title: "Chief Electoral Officer (Admin)",
          subtitle: "Administrative Command Console",
          icon: Sliders,
          badgeClass: "badge-station-admin"
        };
      case "verify":
        return {
          title: "Verification Officer Desk",
          subtitle: "Voter Check-in Station #1",
          icon: ShieldCheck,
          badgeClass: "badge-station-verify"
        };
      case "evm":
        return {
          title: "EVM Electronic Voting Terminal",
          subtitle: "Terminal Alpha-01 (Isolated Booth)",
          icon: Vote,
          badgeClass: "badge-station-evm"
        };
      case "live":
        return {
          title: "Public Results Display",
          subtitle: "Live Telemetry Projector",
          icon: BarChart3,
          badgeClass: "badge-station-live"
        };
      default:
        return {
          title: "Official Terminal",
          subtitle: "Station Active",
          icon: Sliders,
          badgeClass: "badge-station-admin"
        };
    }
  };

  const station = getStationBadge();
  const StationIcon = station.icon;

  return (
    <header className="navbar-container navbar-isolated">
      <div className="navbar-top">
        {/* Brand Group */}
        <div className="brand-group">
          <div className="brand-icon-box">
            <Vote size={26} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">E-VOTE CAMPUS</div>
            <div className="brand-subtitle">
              {electionConfig.institution}
            </div>
          </div>
        </div>

        {/* Current Authenticated Station Display (Isolated Role) */}
        <div className={`station-identity-box ${station.badgeClass}`}>
          <div className="sib-icon">
            <StationIcon size={20} />
          </div>
          <div className="sib-text">
            <div className="sib-role">{station.title}</div>
            <div className="sib-station">{station.subtitle}</div>
          </div>
        </div>

        {/* Telemetry & Quick Station Controls */}
        <div className="navbar-telemetry">
          {/* EVM Status Beacon (Shown only for Verification Desk and Admin, hidden on EVM Booth to avoid clutter) */}
          {(userSession?.role === "verify" || userSession?.role === "admin") && (
            <div className={`booth-beacon ${isBoothUnlocked ? "beacon-unlocked" : isBoothSubmitting ? "beacon-submitting" : "beacon-locked"}`}>
              <span className="beacon-dot"></span>
              <span className="beacon-text">
                {isBoothSubmitting ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span>⏳ EVM Recording Ballot...</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelBoothAuthorization();
                      }}
                      className="beacon-reset-btn"
                      title="EVM stuck in recording? Click to force-lock terminal to Standby"
                    >
                      Reset
                    </button>
                  </span>
                ) : isBoothUnlocked ? (
                  <>
                    <Unlock size={14} /> EVM Unlocked: {boothState.authorizedVoter?.name?.split(" ")[0]}
                  </>
                ) : (
                  <>
                    <Lock size={14} /> EVM Terminal Locked
                  </>
                )}
              </span>
            </div>
          )}

          {/* Turnout Pill (Hidden on EVM Booth) */}
          {userSession?.role !== "evm" && (
            <div className="turnout-pill" title={`${votedCount} of ${totalVoters} voters voted`}>
              <Radio size={14} className="turnout-pulse" />
              <span>Turnout: <strong>{turnoutPercent}%</strong> ({votedCount}/{totalVoters})</span>
            </div>
          )}

          {/* Firebase Connection Indicator - Read-Only Status Badge (No Sensitive API keys popup) */}
          {userSession?.role !== "evm" && (
            <div 
              className={`firebase-pill ${firebaseStatus.connected ? "fb-connected" : "fb-local"}`}
              title={firebaseStatus.connected ? "Cloud Firestore Connected (election-live-8921a)" : "Operating in Local Sync Mode"}
              style={{ cursor: "default" }}
            >
              <Cloud size={15} />
              <span>{firebaseStatus.connected ? "Firebase Live" : "Local Sync"}</span>
            </div>
          )}

          {/* Dedicated Sign Out / Lock Button */}
          <button
            onClick={onLogout}
            className="btn-logout-station"
            title="Sign out of this role and return to Login Screen"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
