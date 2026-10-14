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
  User,
  Radio,
  Clock,
  Award,
  Megaphone,
  Trash2,
  Send,
  Sparkles,
  Plus,
  Terminal,
  Activity,
  Check
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { Modal } from "../common/Modal";
import { initialStationCredentials, initialBooths } from "../../data/initialData";

export const SettingsTab = ({ onOpenFirebaseModal }) => {
  const { 
    electionConfig, 
    setElectionConfig, 
    setElectionStatus, 
    setElectionStage,
    publishBulletin,
    clearBulletin,
    publishResultsTally,
    resetAllVotes,
    reseedCompleteDatabase,
    forcePushToFirestore,
    firebaseStatus,
    voters,
    ballots,
    booths,
    addBooth,
    updateBooth,
    deleteBooth,
    resetBooth,
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

  // Multi-Booth Management State
  const allBooths = booths && Array.isArray(booths) && booths.length > 0 ? booths : (electionConfig?.booths || initialBooths);
  const [showAddBoothModal, setShowAddBoothModal] = useState(false);
  const [newBoothName, setNewBoothName] = useState(`EVM Terminal 0${allBooths.length + 1} (Booth #${allBooths.length + 1})`);
  const [newBoothShortName, setNewBoothShortName] = useState(`Booth #${allBooths.length + 1}`);
  const [newBoothUsername, setNewBoothUsername] = useState(`booth${allBooths.length + 1}`);
  const [newBoothPasscode, setNewBoothPasscode] = useState("booth123");
  const [showBoothPasswords, setShowBoothPasswords] = useState({});
  const [editingBoothCreds, setEditingBoothCreds] = useState({});
  const [boothFeedback, setBoothFeedback] = useState(null);
  const [boothToDelete, setBoothToDelete] = useState(null);

  // Results Publication Schedule State
  const [resultsInterval, setResultsInterval] = useState(electionConfig?.resultsUpdateInterval || "15 minutes");
  const [customInterval, setCustomInterval] = useState("");
  const [resultsPublishFeedback, setResultsPublishFeedback] = useState(null);

  // Public Portal Stage & Periodic Bulletin State
  const currentStage = electionConfig?.electionStage || "LIVE_POLL";
  const [bulletinTitle, setBulletinTitle] = useState("");
  const [bulletinMessage, setBulletinMessage] = useState("");
  const [includeTurnout, setIncludeTurnout] = useState(true);
  const [bulletinFeedback, setBulletinFeedback] = useState(null);

  const totalVotersCount = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const liveTurnoutPct = totalVotersCount > 0 ? ((votedCount / totalVotersCount) * 100).toFixed(1) : 0;

  const bulletinPresets = [
    {
      label: "Round 1 Milestone",
      title: "Round 1 Turnout Milestone",
      message: "Voting has commenced across all 3 EVM terminals. Students from 1st and 3rd Semesters are casting their ballots smoothly."
    },
    {
      label: "Mid-Poll Progress",
      title: "Mid-Poll Voting Progress",
      message: "Over 50% voter attendance recorded. Verification desks are actively clearing student queues at Booth 1, 2, and 3."
    },
    {
      label: "Final 20 Mins Call",
      title: "Final 20 Minutes Warning",
      message: "Final 20 minutes remaining! All eligible nursing students who have not yet voted are requested to reach the Verification Desk immediately."
    },
    {
      label: "Official Notice",
      title: "Chief Electoral Officer Notice",
      message: "EVM booths are operating with strict ballot secrecy. Maintain silence and discipline near the auditorium voting area."
    }
  ];

  const handlePublishBulletin = (e) => {
    e.preventDefault();
    if (!bulletinTitle.trim() && !bulletinMessage.trim()) {
      setBulletinFeedback({ type: "error", text: "Please enter a bulletin title or announcement message." });
      return;
    }
    publishBulletin({
      title: bulletinTitle.trim() || "Official Election Bulletin",
      message: bulletinMessage.trim(),
      includeTurnout
    });
    setBulletinTitle("");
    setBulletinMessage("");
    setBulletinFeedback({ type: "success", text: "Official bulletin successfully broadcast to Public Portal!" });
    setTimeout(() => setBulletinFeedback(null), 3500);
  };

  const handleClearBulletin = () => {
    clearBulletin();
    setBulletinFeedback({ type: "success", text: "Active bulletin removed from Public Portal." });
    setTimeout(() => setBulletinFeedback(null), 3000);
  };

  const handlePublishResults = (isFinal = false) => {
    const notice = customInterval.trim() || resultsInterval || "15 minutes";
    const res = publishResultsTally({ nextUpdateNotice: notice, isFinal });
    if (res.success) {
      setResultsPublishFeedback({
        type: "success",
        text: isFinal 
          ? "🏆 Final Certified Results successfully published to Public Portal with declared Winners!"
          : `Official Live Results tally successfully published! (Next update scheduled: ${notice})`
      });
      setTimeout(() => setResultsPublishFeedback(null), 4000);
    }
  };

  const handleCreateBooth = (e) => {
    e.preventDefault();
    if (!newBoothName.trim() || !newBoothUsername.trim() || !newBoothPasscode.trim()) {
      setBoothFeedback({ type: "error", text: "All booth fields are required." });
      return;
    }
    const res = addBooth({
      name: newBoothName.trim(),
      shortName: newBoothShortName.trim(),
      username: newBoothUsername.trim(),
      passcode: newBoothPasscode.trim()
    });
    if (res.success) {
      setShowAddBoothModal(false);
      const nextNum = allBooths.length + 2;
      setNewBoothName(`EVM Terminal 0${nextNum} (Booth #${nextNum})`);
      setNewBoothShortName(`Booth #${nextNum}`);
      setNewBoothUsername(`booth${nextNum}`);
      setNewBoothPasscode("booth123");
      setBoothFeedback({ type: "success", text: `Successfully provisioned ${newBoothShortName.trim()}!` });
      setTimeout(() => setBoothFeedback(null), 3500);
    }
  };

  const handleSaveBoothEdits = (boothId) => {
    const creds = editingBoothCreds[boothId];
    if (!creds) return;
    updateBooth(boothId, creds);
    setBoothFeedback({ type: "success", text: "Booth station credentials updated and synced to cloud!" });
    setTimeout(() => setBoothFeedback(null), 3000);
  };

  const handleDeleteBooth = (boothId, boothName) => {
    setBoothToDelete({ id: boothId, name: boothName });
  };

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
        {/* 1. PUBLIC PORTAL DISPLAY STAGE & EXPERIENCE CONTROLS */}
        <div className="settings-card card-base settings-card-wide" style={{ border: "2px solid rgba(37, 99, 235, 0.4)", background: "linear-gradient(180deg, rgba(37, 99, 235, 0.05) 0%, rgba(15, 23, 42, 0.3) 100%)" }}>
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <Radio size={22} color="#2563eb" />
              <h3>Public Portal Display Stage & Live Experience</h3>
            </div>
            <span className={`badge ${
              currentStage === "PRE_POLL" 
                ? "badge-warning" 
                : currentStage === "LIVE_POLL" 
                ? "badge-success" 
                : "badge-blue"
            }`} style={{ fontWeight: 800 }}>
              ● Currently Live: {currentStage === "PRE_POLL" ? "Pre-Poll Countdown" : currentStage === "LIVE_POLL" ? "Voting Live (Timer Hidden)" : "Concluded (Winners Declared)"}
            </span>
          </div>

          <p className="settings-card-desc">
            Directly controls what public visitors, students, and auditorium screens see without any login. Switch seamlessly between Pre-Poll Countdown, Live Voting mode, and Final Winners declaration.
          </p>

          <div className="status-selector-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {/* Stage 1: Pre-Poll Countdown */}
            <button
              type="button"
              onClick={() => setElectionStage("PRE_POLL")}
              className={`status-choice-btn ${currentStage === "PRE_POLL" ? "selected status-paused" : ""}`}
              style={{ textAlign: "left" }}
            >
              <div className="choice-icon-wrap" style={{ background: currentStage === "PRE_POLL" ? "#f59e0b" : "rgba(245, 158, 11, 0.15)", color: currentStage === "PRE_POLL" ? "#fff" : "#f59e0b" }}>
                <Clock size={20} />
              </div>
              <div className="choice-text">
                <div className="choice-name">1. Pre-Poll (Countdown to 3:00 PM)</div>
                <div className="choice-desc">Shows countdown clock to 3:00 PM, all 14 nominated candidates & manifestos. Voting booths locked.</div>
              </div>
            </button>

            {/* Stage 2: Voting Live (No timer) */}
            <button
              type="button"
              onClick={() => setElectionStage("LIVE_POLL")}
              className={`status-choice-btn ${currentStage === "LIVE_POLL" ? "selected status-active" : ""}`}
              style={{ textAlign: "left" }}
            >
              <div className="choice-icon-wrap" style={{ background: currentStage === "LIVE_POLL" ? "#10b981" : "rgba(16, 185, 129, 0.15)", color: currentStage === "LIVE_POLL" ? "#fff" : "#10b981" }}>
                <Radio size={20} />
              </div>
              <div className="choice-text">
                <div className="choice-name">2. Voting Live (Timer Hidden)</div>
                <div className="choice-desc">Prominently displays green "🟢 VOTING IS LIVE & IN PROGRESS" banner, hides timer, showcases candidates per office.</div>
              </div>
            </button>

            {/* Stage 3: Concluded Winners */}
            <button
              type="button"
              onClick={() => setElectionStage("CONCLUDED")}
              className={`status-choice-btn ${currentStage === "CONCLUDED" ? "selected status-concluded" : ""}`}
              style={{ textAlign: "left" }}
            >
              <div className="choice-icon-wrap" style={{ background: currentStage === "CONCLUDED" ? "#3b82f6" : "rgba(59, 130, 246, 0.15)", color: currentStage === "CONCLUDED" ? "#fff" : "#3b82f6" }}>
                <Award size={20} />
              </div>
              <div className="choice-text">
                <div className="choice-name">3. Concluded (Declare Winners)</div>
                <div className="choice-desc">Seals voting, declares official Hall of Winners with gold winner cards, 👑 crowns, vote leads, and certified standing.</div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. PERIODIC MID-POLL BULLETIN PUBLISHER (15-20 MIN UPDATES) */}
        <div className="settings-card card-base settings-card-wide" style={{ border: "2px solid rgba(16, 185, 129, 0.35)", background: "linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(15, 23, 42, 0.3) 100%)" }}>
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <Megaphone size={22} color="#10b981" />
              <div>
                <h3>Periodic Mid-Poll Bulletin Publisher (15–20 Min Updates)</h3>
                <p className="text-muted text-xs">Post manual progress updates & official notices to the Public Home Screen whenever you choose.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge badge-emerald" style={{ fontWeight: 700 }}>
                Live Turnout: {liveTurnoutPct}% ({votedCount}/{totalVotersCount} Voted)
              </span>
            </div>
          </div>

          {bulletinFeedback && (
            <div className={`alert-box mb-3 ${bulletinFeedback.type === "success" ? "alert-success" : "alert-error"}`}>
              {bulletinFeedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span>{bulletinFeedback.text}</span>
            </div>
          )}

          {/* Active Bulletin Banner Preview */}
          {electionConfig?.activeBulletin ? (
            <div style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1.5px solid rgba(59, 130, 246, 0.35)",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ background: "#2563eb", color: "#ffffff", padding: "2px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 800 }}>
                    ACTIVE ON PUBLIC SCREEN • {electionConfig.activeBulletin.postedAt}
                  </span>
                  {electionConfig.activeBulletin.turnoutPercent !== null && (
                    <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "2px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>
                      Turnout: {electionConfig.activeBulletin.turnoutPercent}%
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.95rem" }}>
                  {electionConfig.activeBulletin.title}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "2px" }}>
                  {electionConfig.activeBulletin.message || "(No extra text)"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearBulletin}
                className="btn-danger"
                style={{ padding: "8px 14px", fontSize: "0.82rem" }}
              >
                <Trash2 size={15} /> Remove Bulletin from Screen
              </button>
            </div>
          ) : (
            <div style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px dashed var(--border-light)",
              marginBottom: "16px",
              color: "#94a3b8",
              fontSize: "0.84rem"
            }}>
              ℹ️ No active bulletin is currently displayed on the Public Home Screen. Use the composer below to post one.
            </div>
          )}

          {/* Preset Buttons for Quick 1-Click Publishing */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-muted" style={{ display: "block", marginBottom: "6px" }}>
              ⚡ Quick 1-Click Bulletin Presets:
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {bulletinPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setBulletinTitle(preset.title);
                    setBulletinMessage(preset.message);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: "0.78rem", padding: "6px 12px", borderRadius: "8px" }}
                >
                  <Sparkles size={13} color="#f59e0b" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bulletin Composer Form */}
          <form onSubmit={handlePublishBulletin}>
            <div className="form-group mb-2">
              <label className="text-xs font-semibold text-muted">Bulletin Headline / Title</label>
              <input
                type="text"
                value={bulletinTitle}
                onChange={(e) => setBulletinTitle(e.target.value)}
                placeholder="e.g. Round 1 Voting Update (15 Mins In)"
                className="form-input form-input-sm"
              />
            </div>

            <div className="form-group mb-2">
              <label className="text-xs font-semibold text-muted">Announcement Message / Instructions</label>
              <textarea
                value={bulletinMessage}
                onChange={(e) => setBulletinMessage(e.target.value)}
                placeholder="Write official announcement or status update for students..."
                className="form-input form-input-sm"
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#cbd5e1" }}>
                <input
                  type="checkbox"
                  checked={includeTurnout}
                  onChange={(e) => setIncludeTurnout(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span>Include live turnout badge (<strong>{liveTurnoutPct}% • {votedCount}/{totalVotersCount} votes</strong>)</span>
              </label>

              <button
                type="submit"
                className="btn-primary"
                style={{ background: "#059669", borderColor: "#059669", padding: "8px 18px", fontWeight: 700 }}
              >
                <Send size={15} /> Broadcast Bulletin to Public Portal
              </button>
            </div>
          </form>
        </div>

        {/* 3. PUBLIC LIVE RESULTS PUBLISHER & UPDATE SCHEDULE */}
        <div className="settings-card card-base settings-card-wide" style={{ border: "2px solid rgba(139, 92, 246, 0.35)", background: "linear-gradient(180deg, rgba(139, 92, 246, 0.04) 0%, rgba(15, 23, 42, 0.3) 100%)" }}>
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <BarChart3 size={22} color="#8b5cf6" />
              <div>
                <h3>Public Live Results Publisher & Tally Schedule</h3>
                <p className="text-muted text-xs">Publish current vote counts to the Public Results tab. Visitors will see interim tallies, lead margins, and the countdown to the next scheduled update.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`badge ${electionConfig?.publishedResults ? "badge-success" : "badge-blue"}`}>
                {electionConfig?.publishedResults 
                  ? `Last Published: ${electionConfig.publishedResults.publishedAt}` 
                  : "Results Not Yet Published"}
              </span>
            </div>
          </div>

          {resultsPublishFeedback && (
            <div className={`alert-box mb-3 ${resultsPublishFeedback.type === "success" ? "alert-success" : "alert-error"}`}>
              {resultsPublishFeedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span>{resultsPublishFeedback.text}</span>
            </div>
          )}

          {/* Current Published Results Overview */}
          {electionConfig?.publishedResults ? (
            <div style={{
              padding: "12px 18px",
              borderRadius: "12px",
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ background: "#7c3aed", color: "#ffffff", padding: "2px 8px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800 }}>
                    CHECKPOINT LIVE • {electionConfig.publishedResults.publishedAt}
                  </span>
                  <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "2px 8px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 700 }}>
                    Turnout: {electionConfig.publishedResults.turnoutPercent}% ({electionConfig.publishedResults.totalVotesRecorded} ballots recorded)
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                  Notice displayed on Public Screen: <strong>"Next official update in ~{electionConfig.publishedResults.nextUpdateNotice}"</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handlePublishResults(false)}
                className="btn-primary"
                style={{ background: "#7c3aed", borderColor: "#7c3aed", padding: "8px 16px", fontSize: "0.82rem" }}
              >
                <RefreshCw size={14} /> Refresh / Re-Publish Current Votes Now
              </button>
            </div>
          ) : (
            <div style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px dashed var(--border-light)",
              marginBottom: "16px",
              color: "#94a3b8",
              fontSize: "0.85rem"
            }}>
              ℹ️ Public Results tab is currently in pre-poll holding. When you click <strong>"Publish Live Results Now"</strong>, the current vote tallies and leader standings will become visible to viewers on the Public Results tab.
            </div>
          )}

          {/* Controls for Schedule Interval and Publishing */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "8px" }}>
            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-muted">Next Scheduled Update Interval (Shown to Public)</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                {["10 minutes", "15 minutes", "20 minutes", "30 minutes"].map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() => {
                      setResultsInterval(interval);
                      setCustomInterval("");
                    }}
                    className="btn-secondary"
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.78rem",
                      borderRadius: "8px",
                      background: (resultsInterval === interval && !customInterval) ? "#7c3aed" : undefined,
                      color: (resultsInterval === interval && !customInterval) ? "#ffffff" : undefined
                    }}
                  >
                    {interval}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or custom notice (e.g. at 2:00 PM / Final Round)"
                value={customInterval}
                onChange={(e) => setCustomInterval(e.target.value)}
                className="form-input form-input-sm"
                style={{ marginTop: "8px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handlePublishResults(false)}
                className="btn-primary"
                style={{ background: "#7c3aed", borderColor: "#7c3aed", padding: "10px 18px", fontWeight: 700 }}
              >
                <BarChart3 size={16} /> 📢 Publish Live Results Tally Now ({votedCount} votes)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Declare FINAL certified results? This will conclude the election and officially crown the winners on the Public Home screen.")) {
                    handlePublishResults(true);
                    setElectionStage("CONCLUDED");
                  }
                }}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontWeight: 700, borderColor: "#d97706", color: "#f59e0b" }}
              >
                <Award size={16} color="#f59e0b" /> Certify & Declare Final Winners
              </button>
            </div>
          </div>
        </div>

        {/* 4. EVM VOTING BOOTHS & TERMINALS MANAGEMENT */}
        <div className="settings-card card-base settings-card-wide" style={{ border: "2px solid rgba(217, 119, 6, 0.35)", background: "linear-gradient(180deg, rgba(217, 119, 6, 0.03) 0%, rgba(15, 23, 42, 0.3) 100%)" }}>
          <div className="settings-card-header">
            <div className="flex-row items-center gap-2">
              <Vote size={22} color="#d97706" />
              <div>
                <h3>EVM Voting Booths & Terminal Stations Management</h3>
                <p className="text-muted text-xs">Manage multi-terminal voting booths. Each device logs in with its own dedicated booth credentials, permanently locking it to that booth.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextNum = allBooths.length + 1;
                setNewBoothName(`EVM Terminal 0${nextNum} (Booth #${nextNum})`);
                setNewBoothShortName(`Booth #${nextNum}`);
                setNewBoothUsername(`booth${nextNum}`);
                setNewBoothPasscode("booth123");
                setShowAddBoothModal(true);
              }}
              className="btn-primary"
              style={{ background: "#d97706", borderColor: "#d97706", fontSize: "0.82rem", padding: "6px 14px" }}
            >
              <Plus size={15} /> Provision New Booth
            </button>
          </div>

          {boothFeedback && (
            <div className={`alert-box mb-3 ${boothFeedback.type === "success" ? "alert-success" : "alert-error"}`}>
              {boothFeedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span>{boothFeedback.text}</span>
            </div>
          )}

          {/* Booths Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "14px", marginTop: "12px" }}>
            {allBooths.map((b, idx) => {
              const edits = editingBoothCreds[b.id] || {
                username: b.username || `booth${idx + 1}`,
                passcode: b.passcode || "booth123",
                name: b.name || `EVM Terminal 0${idx + 1}`
              };
              const isPasswordVisible = showBoothPasswords[b.id];

              return (
                <div key={b.id} className="card-base" style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(217, 119, 6, 0.15)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#e2e8f0" }}>{b.shortName || b.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>ID: <span className="font-mono">{b.id}</span></div>
                      </div>
                    </div>
                    <span className={`badge ${b.status === "UNLOCKED" ? "badge-success" : b.status === "SUBMITTING" ? "badge-warning" : "badge-blue"}`} style={{ fontSize: "0.7rem" }}>
                      {b.status}
                    </span>
                  </div>

                  <div className="form-group mb-2">
                    <label className="text-xs font-semibold text-muted">Station Login ID</label>
                    <input
                      type="text"
                      value={edits.username}
                      onChange={(e) => setEditingBoothCreds({
                        ...editingBoothCreds,
                        [b.id]: { ...edits, username: e.target.value.toLowerCase().trim() }
                      })}
                      className="form-input form-input-sm"
                      placeholder="e.g. booth1"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="text-xs font-semibold text-muted">Security Passcode</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        value={edits.passcode}
                        onChange={(e) => setEditingBoothCreds({
                          ...editingBoothCreds,
                          [b.id]: { ...edits, passcode: e.target.value.trim() }
                        })}
                        className="form-input form-input-sm"
                        placeholder="booth password..."
                        style={{ paddingRight: "36px" }}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowBoothPasswords({
                          ...showBoothPasswords,
                          [b.id]: !isPasswordVisible
                        })}
                        title={isPasswordVisible ? "Hide password" : "Show password"}
                      >
                        {isPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", paddingTop: "8px", borderTop: "1px solid var(--border-light)" }}>
                    <button
                      type="button"
                      onClick={() => handleSaveBoothEdits(b.id)}
                      className="btn-secondary"
                      style={{ fontSize: "0.76rem", padding: "5px 10px" }}
                      title="Save and synchronize changes to this booth"
                    >
                      <Save size={13} /> Save Creds
                    </button>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => resetBooth(b.id)}
                        className="btn-secondary"
                        style={{ fontSize: "0.76rem", padding: "5px 10px" }}
                        title="Force lock booth to standby"
                      >
                        <Lock size={13} /> Lock
                      </button>

                      {allBooths.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBooth(b.id, b.shortName || b.name)}
                          className="btn-danger"
                          style={{ fontSize: "0.76rem", padding: "5px 10px" }}
                          title="Delete this EVM booth"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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

      {/* Modal: Provision New EVM Booth */}
      <Modal
        isOpen={showAddBoothModal}
        onClose={() => setShowAddBoothModal(false)}
        size="md"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Plus size={22} color="#d97706" />
            </div>
            <div>
              <h3>Provision New EVM Terminal Booth</h3>
              <p>Add an additional physical voting terminal to your election</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateBooth}>
          <div className="modal-body-pad">
            <div className="form-group mb-3">
              <label>Official Terminal Name</label>
              <input
                type="text"
                required
                value={newBoothName}
                onChange={(e) => setNewBoothName(e.target.value)}
                className="form-input"
                placeholder="e.g. EVM Terminal 04 (Booth #4)"
              />
            </div>

            <div className="form-group mb-3">
              <label>Short Badge Name</label>
              <input
                type="text"
                required
                value={newBoothShortName}
                onChange={(e) => setNewBoothShortName(e.target.value)}
                className="form-input"
                placeholder="e.g. Booth #4"
              />
            </div>

            <div className="form-group mb-3">
              <label>Station Login ID (Username)</label>
              <input
                type="text"
                required
                value={newBoothUsername}
                onChange={(e) => setNewBoothUsername(e.target.value.toLowerCase().trim())}
                className="form-input"
                placeholder="e.g. booth4"
              />
              <span className="text-muted text-xs">This physical terminal will enter this ID on the login screen.</span>
            </div>

            <div className="form-group mb-3">
              <label>Security Passcode</label>
              <input
                type="text"
                required
                value={newBoothPasscode}
                onChange={(e) => setNewBoothPasscode(e.target.value.trim())}
                className="form-input"
                placeholder="e.g. booth123"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setShowAddBoothModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ background: "#d97706", borderColor: "#d97706" }}
            >
              Provision Booth Terminal
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Booth Confirmation Modal */}
      {boothToDelete && (
        <Modal
          isOpen={!!boothToDelete}
          onClose={() => setBoothToDelete(null)}
          title={`Confirm Deletion: ${boothToDelete.name}`}
          maxWidth="480px"
        >
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", color: "#dc2626" }}>
              <AlertTriangle size={28} />
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>
                Unregister & Delete EVM Station?
              </h4>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{boothToDelete.name}</strong>? This booth terminal will be removed from the system and will no longer appear on the Verification Desk or login options.
            </p>
          </div>
          <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 24px" }}>
            <button
              type="button"
              onClick={() => setBoothToDelete(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const res = deleteBooth(boothToDelete.id);
                if (!res.success) {
                  setBoothFeedback({ type: "error", text: res.message });
                } else {
                  setBoothFeedback({ type: "success", text: `${boothToDelete.name} deleted successfully.` });
                }
                setTimeout(() => setBoothFeedback(null), 3500);
                setBoothToDelete(null);
              }}
              className="btn-danger"
              style={{ fontWeight: 800 }}
            >
              <Trash2 size={16} /> Delete Booth
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
