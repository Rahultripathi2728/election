import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Vote,
  BarChart3,
  Sliders,
  User
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { Modal } from "../common/Modal";
import { initialStationCredentials } from "../../data/initialData";

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
    ballots,
    updateStationCredentials
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

  // Station Passwords Management State
  const activeCreds = electionConfig?.stationCredentials || initialStationCredentials;
  const [stationCreds, setStationCreds] = useState({
    admin: {
      username: activeCreds.admin?.username || "admin",
      passcode: activeCreds.admin?.passcode || "admin123"
    },
    verify: {
      username: activeCreds.verify?.username || "officer",
      passcode: activeCreds.verify?.passcode || "verify123"
    },
    evm: {
      username: activeCreds.evm?.username || "booth",
      passcode: activeCreds.evm?.passcode || "booth123"
    },
    live: {
      username: activeCreds.live?.username || "live",
      passcode: activeCreds.live?.passcode || "live123"
    }
  });

  const [showStationPasswords, setShowStationPasswords] = useState({
    admin: false,
    verify: false,
    evm: false,
    live: false
  });

  const [passwordFeedback, setPasswordFeedback] = useState(null);

  useEffect(() => {
    if (electionConfig?.stationCredentials) {
      setStationCreds({
        admin: {
          username: electionConfig.stationCredentials.admin?.username || "admin",
          passcode: electionConfig.stationCredentials.admin?.passcode || "admin123"
        },
        verify: {
          username: electionConfig.stationCredentials.verify?.username || "officer",
          passcode: electionConfig.stationCredentials.verify?.passcode || "verify123"
        },
        evm: {
          username: electionConfig.stationCredentials.evm?.username || "booth",
          passcode: electionConfig.stationCredentials.evm?.passcode || "booth123"
        },
        live: {
          username: electionConfig.stationCredentials.live?.username || "live",
          passcode: electionConfig.stationCredentials.live?.passcode || "live123"
        }
      });
    }
  }, [electionConfig?.stationCredentials]);

  const handleSavePasswords = (e) => {
    e.preventDefault();
    if (
      !stationCreds.admin.username || !stationCreds.admin.passcode ||
      !stationCreds.verify.username || !stationCreds.verify.passcode ||
      !stationCreds.evm.username || !stationCreds.evm.passcode ||
      !stationCreds.live.username || !stationCreds.live.passcode
    ) {
      setPasswordFeedback({ type: "error", text: "Station IDs and Security Passwords cannot be empty." });
      return;
    }

    const payload = {
      admin: {
        role: "admin",
        username: stationCreds.admin.username.trim(),
        passcode: stationCreds.admin.passcode.trim(),
        label: "Chief Electoral Officer (Admin)"
      },
      verify: {
        role: "verify",
        username: stationCreds.verify.username.trim(),
        passcode: stationCreds.verify.passcode.trim(),
        label: "Verification Officer Desk"
      },
      evm: {
        role: "evm",
        username: stationCreds.evm.username.trim(),
        passcode: stationCreds.evm.passcode.trim(),
        label: "EVM Voting Terminal"
      },
      live: {
        role: "live",
        username: stationCreds.live.username.trim(),
        passcode: stationCreds.live.passcode.trim(),
        label: "Public Results Display"
      }
    };

    updateStationCredentials(payload);
    setPasswordFeedback({
      type: "success",
      text: "Station security credentials successfully saved and synchronized across all terminals via Cloud Firestore!"
    });
    setTimeout(() => setPasswordFeedback(null), 4000);
  };

  const handleResetDefaultPasswords = () => {
    updateStationCredentials(initialStationCredentials);
    setStationCreds({
      admin: { username: initialStationCredentials.admin.username, passcode: initialStationCredentials.admin.passcode },
      verify: { username: initialStationCredentials.verify.username, passcode: initialStationCredentials.verify.passcode },
      evm: { username: initialStationCredentials.evm.username, passcode: initialStationCredentials.evm.passcode },
      live: { username: initialStationCredentials.live.username, passcode: initialStationCredentials.live.passcode }
    });
    setPasswordFeedback({
      type: "success",
      text: "Factory default station credentials restored (admin / admin123, officer / verify123, booth / booth123, live / live123)!"
    });
    setTimeout(() => setPasswordFeedback(null), 4000);
  };

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

        {/* Station Security & Passwords Management Card */}
        <div className="settings-card card-base settings-card-wide">
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <ShieldCheck size={22} color="#2563eb" />
              <h3>Station Security & Access Passwords (Production Control)</h3>
            </div>
            <span className="badge badge-blue">Cloud Synchronized</span>
          </div>

          <p className="settings-card-desc">
            Directly configure custom Station IDs and security passwords for each election terminal. Changes save and synchronize in real time to Google Cloud Firestore across all desks.
          </p>

          {passwordFeedback && (
            <div className={`alert-box mb-3 ${passwordFeedback.type === "success" ? "alert-success" : "alert-error"}`}>
              {passwordFeedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span>{passwordFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSavePasswords}>
            <div className="station-security-grid">
              {/* 1. Admin */}
              <div className="station-security-box">
                <div className="station-security-head">
                  <div className="ss-icon" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb" }}>
                    <Sliders size={18} />
                  </div>
                  <div>
                    <div className="ss-title">Chief Electoral Officer</div>
                    <div className="ss-badge">Admin Command Station</div>
                  </div>
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs font-semibold text-muted">Station ID / Username</label>
                  <input
                    type="text"
                    required
                    value={stationCreds.admin.username}
                    onChange={(e) => setStationCreds({
                      ...stationCreds,
                      admin: { ...stationCreds.admin, username: e.target.value }
                    })}
                    className="form-input form-input-sm"
                    placeholder="e.g. admin"
                  />
                </div>

                <div className="form-group mb-1">
                  <label className="text-xs font-semibold text-muted">Security Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showStationPasswords.admin ? "text" : "password"}
                      required
                      value={stationCreds.admin.passcode}
                      onChange={(e) => setStationCreds({
                        ...stationCreds,
                        admin: { ...stationCreds.admin, passcode: e.target.value }
                      })}
                      className="form-input form-input-sm"
                      placeholder="Password..."
                      style={{ paddingRight: "36px" }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowStationPasswords({
                        ...showStationPasswords,
                        admin: !showStationPasswords.admin
                      })}
                      title={showStationPasswords.admin ? "Hide password" : "Show password"}
                    >
                      {showStationPasswords.admin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Verification Desk */}
              <div className="station-security-box">
                <div className="station-security-head">
                  <div className="ss-icon" style={{ background: "rgba(5, 150, 105, 0.12)", color: "#059669" }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="ss-title">Verification Officer Desk</div>
                    <div className="ss-badge">Voter Check-In Station</div>
                  </div>
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs font-semibold text-muted">Station ID / Username</label>
                  <input
                    type="text"
                    required
                    value={stationCreds.verify.username}
                    onChange={(e) => setStationCreds({
                      ...stationCreds,
                      verify: { ...stationCreds.verify, username: e.target.value }
                    })}
                    className="form-input form-input-sm"
                    placeholder="e.g. officer"
                  />
                </div>

                <div className="form-group mb-1">
                  <label className="text-xs font-semibold text-muted">Security Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showStationPasswords.verify ? "text" : "password"}
                      required
                      value={stationCreds.verify.passcode}
                      onChange={(e) => setStationCreds({
                        ...stationCreds,
                        verify: { ...stationCreds.verify, passcode: e.target.value }
                      })}
                      className="form-input form-input-sm"
                      placeholder="Password..."
                      style={{ paddingRight: "36px" }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowStationPasswords({
                        ...showStationPasswords,
                        verify: !showStationPasswords.verify
                      })}
                      title={showStationPasswords.verify ? "Hide password" : "Show password"}
                    >
                      {showStationPasswords.verify ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. EVM Terminal */}
              <div className="station-security-box">
                <div className="station-security-head">
                  <div className="ss-icon" style={{ background: "rgba(217, 119, 6, 0.12)", color: "#d97706" }}>
                    <Vote size={18} />
                  </div>
                  <div>
                    <div className="ss-title">EVM Voting Terminal</div>
                    <div className="ss-badge">Secret Ballot Booth</div>
                  </div>
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs font-semibold text-muted">Station ID / Username</label>
                  <input
                    type="text"
                    required
                    value={stationCreds.evm.username}
                    onChange={(e) => setStationCreds({
                      ...stationCreds,
                      evm: { ...stationCreds.evm, username: e.target.value }
                    })}
                    className="form-input form-input-sm"
                    placeholder="e.g. booth"
                  />
                </div>

                <div className="form-group mb-1">
                  <label className="text-xs font-semibold text-muted">Security Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showStationPasswords.evm ? "text" : "password"}
                      required
                      value={stationCreds.evm.passcode}
                      onChange={(e) => setStationCreds({
                        ...stationCreds,
                        evm: { ...stationCreds.evm, passcode: e.target.value }
                      })}
                      className="form-input form-input-sm"
                      placeholder="Password..."
                      style={{ paddingRight: "36px" }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowStationPasswords({
                        ...showStationPasswords,
                        evm: !showStationPasswords.evm
                      })}
                      title={showStationPasswords.evm ? "Hide password" : "Show password"}
                    >
                      {showStationPasswords.evm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Public Screen */}
              <div className="station-security-box">
                <div className="station-security-head">
                  <div className="ss-icon" style={{ background: "rgba(124, 58, 237, 0.12)", color: "#7c3aed" }}>
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div className="ss-title">Public Results Display</div>
                    <div className="ss-badge">Live Tally Projector</div>
                  </div>
                </div>

                <div className="form-group mb-2">
                  <label className="text-xs font-semibold text-muted">Station ID / Username</label>
                  <input
                    type="text"
                    required
                    value={stationCreds.live.username}
                    onChange={(e) => setStationCreds({
                      ...stationCreds,
                      live: { ...stationCreds.live, username: e.target.value }
                    })}
                    className="form-input form-input-sm"
                    placeholder="e.g. live"
                  />
                </div>

                <div className="form-group mb-1">
                  <label className="text-xs font-semibold text-muted">Security Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showStationPasswords.live ? "text" : "password"}
                      required
                      value={stationCreds.live.passcode}
                      onChange={(e) => setStationCreds({
                        ...stationCreds,
                        live: { ...stationCreds.live, passcode: e.target.value }
                      })}
                      className="form-input form-input-sm"
                      placeholder="Password..."
                      style={{ paddingRight: "36px" }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowStationPasswords({
                        ...showStationPasswords,
                        live: !showStationPasswords.live
                      })}
                      title={showStationPasswords.live ? "Hide password" : "Show password"}
                    >
                      {showStationPasswords.live ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-row items-center justify-between gap-3 mt-4" style={{ flexWrap: "wrap", paddingTop: "14px", borderTop: "1px solid var(--border-light)" }}>
              <button type="submit" className="btn-primary">
                <Save size={16} /> Save & Synchronize Passwords
              </button>
              <button
                type="button"
                onClick={handleResetDefaultPasswords}
                className="btn-secondary text-sm"
              >
                <RotateCcw size={14} /> Restore Factory Passwords
              </button>
            </div>
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
