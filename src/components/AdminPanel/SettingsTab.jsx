import React, { useState } from "react";
import { 
  Settings, 
  RotateCcw, 
  Cloud, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle, 
  Save,
  Database,
  RefreshCw,
  Server,
  ShieldCheck
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { Modal } from "../common/Modal";

export const SettingsTab = ({ onOpenFirebaseModal }) => {
  const { 
    electionConfig, 
    setElectionConfig, 
    setElectionStatus, 
    resetAllVotes,
    reseedCompleteDatabase,
    forcePushToFirestore,
    firebaseStatus,
    voters,
    ballots
  } = useElection();

  const [title, setTitle] = useState(electionConfig.title || "");
  const [inst, setInst] = useState(electionConfig.institution || "");
  const [delay, setDelay] = useState(electionConfig.autoLockDelaySeconds || 4);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState("");
  const [showReseedConfirm, setShowReseedConfirm] = useState(false);
  const [reseedCheckbox, setReseedCheckbox] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

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
    if (resetConfirmationInput.trim().toUpperCase() !== "RESET") return;
    resetAllVotes();
    setShowResetConfirm(false);
    setResetConfirmationInput("");
    setSyncFeedback({ type: "success", text: "All votes cleared successfully! Terminal ready for fresh voting." });
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleReseed = async () => {
    if (!reseedCheckbox) return;
    await reseedCompleteDatabase();
    setShowReseedConfirm(false);
    setReseedCheckbox(false);
    setSyncFeedback({ type: "success", text: "Successfully restored official 233 students roster (B.Sc Nursing 1st, 3rd, 5th & 7th Sem) to Cloud Firestore!" });
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  return (
    <div className="admin-subtab-container fade-in">
      <div className="subtab-header">
        <div>
          <h2 className="subtab-title">Election Governance & System Controls</h2>
          <p className="subtab-desc">
            Manage election lifecycle, verify cloud database synchronization, configure auto-lock timing, and safely control poll resets.
          </p>
        </div>
      </div>

      {syncFeedback && (
        <div className={`alert-box mb-4 ${syncFeedback.type === "success" ? "alert-success" : "alert-error"}`}>
          {syncFeedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{syncFeedback.text}</span>
        </div>
      )}

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

        {/* Real-Time Cloud Sync Card - STREAMLINED & NON-TECHNICAL */}
        <div className="settings-card card-base">
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <Cloud size={20} color="#059669" />
              <h3>Real-Time Cloud Data Protection</h3>
            </div>
            <span className="badge badge-success">
              {firebaseStatus.connected ? "Active & Synchronized" : "Local Protected Mode"}
            </span>
          </div>

          <p className="settings-card-desc">
            All votes cast on EVM terminals, voter verifications, and candidate changes are automatically saved to Google Cloud Firestore in real time.
          </p>

          <div className="backend-info-list">
            <div className="backend-info-item">
              <span className="bi-label">Cloud Sync Status:</span>
              <span className="bi-val text-emerald font-semibold">● Real-time Live</span>
            </div>
            <div className="backend-info-item">
              <span className="bi-label">Registered Student Voters:</span>
              <span className="bi-val font-semibold">{voters.length} Students</span>
            </div>
            <div className="backend-info-item">
              <span className="bi-label">Ballots Cast in Cloud:</span>
              <span className="bi-val font-semibold">{ballots.length} Ballots</span>
            </div>
          </div>
        </div>

        {/* Database Management Card - ACCURATE 233 STUDENTS ROSTER */}
        <div className="settings-card card-base">
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <Database size={20} color="#2563eb" />
              <h3>Official Student Roster (233 Students)</h3>
            </div>
          </div>

          <p className="settings-card-desc">
            Contains all official 233 student voters across B.Sc Nursing 1st, 3rd, 5th & 7th Semesters and the 5 electoral positions.
          </p>

          <button
            onClick={() => {
              setReseedCheckbox(false);
              setShowReseedConfirm(true);
            }}
            className="btn-secondary"
          >
            <Database size={16} /> Restore Official 233 Students Database
          </button>
        </div>

        {/* Reset / Fresh Election Card - WITH SAFETY LOCK */}
        <div className="settings-card card-base card-danger-subtle">
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <AlertTriangle size={20} color="#dc2626" />
              <h3 className="text-danger">Reset Polled Votes (Safety Locked)</h3>
            </div>
          </div>
          <p className="settings-card-desc">
            Clears candidate vote counters to 0 and restores all students to "Eligible to Vote" for a fresh mock or official election. Candidates and posts remain preserved.
          </p>
          <button
            onClick={() => {
              setResetConfirmationInput("");
              setShowResetConfirm(true);
            }}
            className="btn-danger"
          >
            <RotateCcw size={16} /> Clear All Polled Votes
          </button>
        </div>
      </div>

      {/* Confirmation Modal - Reset Ballots WITH ENTERPRISE SAFETY LOCK */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => {
          setShowResetConfirm(false);
          setResetConfirmationInput("");
        }}
        size="md"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge modal-icon-danger">
              <AlertTriangle size={22} color="#dc2626" />
            </div>
            <div>
              <h3 className="text-danger">Confirm Ballot Reset</h3>
              <p>Protected Action: Safety lock required</p>
            </div>
          </div>
        </div>

        <div className="modal-body-pad">
          <p>
            Are you sure you want to reset all candidate vote tallies back to 0 and restore all <strong>{voters.length}</strong> students 
            to <strong>"Eligible to Vote"</strong>?
          </p>
          <p className="text-muted text-sm mt-2">
            Candidates, electoral posts, and student records will <strong>not</strong> be deleted. Only ballot counts will reset.
          </p>

          <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.25)", borderRadius: "10px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f87171", display: "block", marginBottom: "6px" }}>
              🔒 Type "RESET" to unlock button:
            </label>
            <input
              type="text"
              placeholder="RESET"
              value={resetConfirmationInput}
              onChange={(e) => setResetConfirmationInput(e.target.value)}
              className="form-input"
              style={{ textTransform: "uppercase", letterSpacing: "2px", fontWeight: "bold" }}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={() => {
              setShowResetConfirm(false);
              setResetConfirmationInput("");
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={resetConfirmationInput.trim().toUpperCase() !== "RESET"}
            onClick={handleResetElection}
            className="btn-danger"
          >
            Yes, Clear All Ballots
          </button>
        </div>
      </Modal>

      {/* Confirmation Modal - Reseed 233 Students via Portal */}
      <Modal
        isOpen={showReseedConfirm}
        onClose={() => {
          setShowReseedConfirm(false);
          setReseedCheckbox(false);
        }}
        size="md"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Database size={22} color="#2563eb" />
            </div>
            <div>
              <h3>Restore Official 233 Students Roster</h3>
              <p>Re-populate official university student database</p>
            </div>
          </div>
        </div>

        <div className="modal-body-pad">
          <p>
            This will restore the complete official dataset of <strong>233 student voters</strong> across B.Sc Nursing 1st, 3rd, 5th, and 7th Semesters, along with all 14 nominated candidates and 5 electoral posts.
          </p>

          <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.25)", borderRadius: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "#cbd5e1" }}>
              <input
                type="checkbox"
                checked={reseedCheckbox}
                onChange={(e) => setReseedCheckbox(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>I understand this will restore initial data and reset votes</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={() => {
              setShowReseedConfirm(false);
              setReseedCheckbox(false);
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reseedCheckbox}
            onClick={handleReseed}
            className="btn-primary"
          >
            Restore & Sync Database
          </button>
        </div>
      </Modal>
    </div>
  );
};
