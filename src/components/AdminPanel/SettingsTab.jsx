import React, { useState } from "react";
import { 
  Settings, 
  RotateCcw, 
  Cloud, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle, 
  Save 
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";

export const SettingsTab = ({ onOpenFirebaseModal }) => {
  const { electionConfig, setElectionConfig, setElectionStatus, resetAllVotes } = useElection();

  const [title, setTitle] = useState(electionConfig.title || "");
  const [inst, setInst] = useState(electionConfig.institution || "");
  const [delay, setDelay] = useState(electionConfig.autoLockDelaySeconds || 4);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setElectionConfig((prev) => ({
      ...prev,
      title: title.trim(),
      institution: inst.trim(),
      autoLockDelaySeconds: Number(delay)
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetElection = () => {
    resetAllVotes();
    setShowResetConfirm(false);
  };

  return (
    <div className="admin-subtab-container fade-in">
      <div className="subtab-header">
        <div>
          <h2 className="subtab-title">Election Governance & System Controls</h2>
          <p className="subtab-desc">
            Configure institutional parameters, election lifecycle status, auto-lock terminal timing, and database reset.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Election Status Lifecycle Card */}
        <div className="settings-card card-base">
          <div className="settings-card-header">
            <h3>Election Lifecycle State</h3>
            <span className={`badge ${
              electionConfig.status === "ACTIVE" 
                ? "badge-success" 
                : electionConfig.status === "PAUSED" 
                ? "badge-warning" 
                : "badge-blue"
            }`}>
              Current: {electionConfig.status}
            </span>
          </div>

          <p className="settings-card-desc">
            Controls whether EVM voting booths and verification desks accept authorizations.
          </p>

          <div className="status-selector-grid">
            <button
              onClick={() => setElectionStatus("ACTIVE")}
              className={`status-choice-btn ${electionConfig.status === "ACTIVE" ? "selected status-active" : ""}`}
            >
              <div className="choice-icon-wrap">
                <Play size={20} />
              </div>
              <div className="choice-text">
                <div className="choice-name">ACTIVE (Voting Live)</div>
                <div className="choice-desc">Polling stations open, voters may cast ballots</div>
              </div>
            </button>

            <button
              onClick={() => setElectionStatus("PAUSED")}
              className={`status-choice-btn ${electionConfig.status === "PAUSED" ? "selected status-paused" : ""}`}
            >
              <div className="choice-icon-wrap">
                <Pause size={20} />
              </div>
              <div className="choice-text">
                <div className="choice-name">PAUSED (Break / Halt)</div>
                <div className="choice-desc">Temporarily freeze all EVM voting activity</div>
              </div>
            </button>

            <button
              onClick={() => setElectionStatus("CONCLUDED")}
              className={`status-choice-btn ${electionConfig.status === "CONCLUDED" ? "selected status-concluded" : ""}`}
            >
              <div className="choice-icon-wrap">
                <CheckCircle size={20} />
              </div>
              <div className="choice-text">
                <div className="choice-name">CONCLUDED (Polls Closed)</div>
                <div className="choice-desc">Seal ballots, lock inputs, certify final tally</div>
              </div>
            </button>
          </div>
        </div>

        {/* General Details Form */}
        <div className="settings-card card-base">
          <div className="settings-card-header">
            <h3>Institutional Details</h3>
          </div>

          {savedSuccess && (
            <div className="alert-box alert-success">
              <CheckCircle size={16} />
              <span>Election settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveGeneral} className="settings-form">
            <div className="form-group">
              <label>Election Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Institution / University Name</label>
              <input
                type="text"
                value={inst}
                onChange={(e) => setInst(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>EVM Auto-Lock Reset Delay: <strong>{delay} seconds</strong></label>
              <input
                type="range"
                min={2}
                max={10}
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                className="form-slider"
              />
              <span className="text-muted text-sm">
                Time the electronic voting screen displays the confirmation slip before auto-locking for the next voter.
              </span>
            </div>

            <button type="submit" className="btn-primary">
              <Save size={16} /> Save Changes
            </button>
          </form>
        </div>

        {/* Firebase Cloud Sync Card */}
        <div className="settings-card card-base">
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <Cloud size={20} color="#2563eb" />
              <h3>Firebase Cloud Synchronization</h3>
            </div>
          </div>
          <p className="settings-card-desc">
            Connect Firestore and Firebase Realtime Database for cross-device cloud synchronization over the internet.
          </p>
          <button onClick={onOpenFirebaseModal} className="btn-secondary">
            <Settings size={16} /> Open Firebase Configurator
          </button>
        </div>

        {/* Reset / Fresh Election Card */}
        <div className="settings-card card-base card-danger-subtle">
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <AlertTriangle size={20} color="#dc2626" />
              <h3 className="text-danger">Reset Election Ballots (Testing & Fresh Run)</h3>
            </div>
          </div>
          <p className="settings-card-desc">
            Clears all polled votes across candidates and resets all registered students back to "Eligible to Vote". 
            Positions and registered candidates remain intact.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-danger"
          >
            <RotateCcw size={16} /> Reset All Votes to Zero
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge modal-icon-danger">
                  <AlertTriangle size={22} color="#dc2626" />
                </div>
                <div>
                  <h3 className="text-danger">Confirm Election Reset</h3>
                  <p>This action will wipe all votes polled so far!</p>
                </div>
              </div>
            </div>

            <div className="modal-body-pad">
              <p>
                Are you sure you want to reset all candidate vote tallies to 0 and restore all student voter statuses 
                to <strong>"Eligible to Vote"</strong>?
              </p>
              <div className="modal-footer mt-4">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetElection}
                  className="btn-danger"
                >
                  Yes, Reset All Votes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
