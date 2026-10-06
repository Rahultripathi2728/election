import React, { useState, useEffect } from "react";
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Unlock, 
  Lock, 
  UserCheck, 
  GraduationCap, 
  User, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Radio,
  Clock
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";

export const VerificationPanel = () => {
  const { 
    voters, 
    electionConfig, 
    verifyStudent, 
    authorizeVoterForBooth, 
    cancelBoothAuthorization 
  } = useElection();

  const [inputQuery, setInputQuery] = useState("");
  const [currentVerification, setCurrentVerification] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const boothState = electionConfig.boothState || {};
  const isBoothUnlocked = boothState.status === "UNLOCKED";
  const isBoothSubmitting = boothState.status === "SUBMITTING";

  // Quick lookup function
  const handlePerformLookup = (idToLookup) => {
    const query = (idToLookup || inputQuery).trim();
    if (!query) {
      setCurrentVerification(null);
      return;
    }

    const result = verifyStudent(query);
    setCurrentVerification(result);
    setFeedbackMessage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If we already have an eligible verification on screen, pressing enter authorizes them!
      if (currentVerification && currentVerification.status === "ELIGIBLE") {
        handleAuthorize();
      } else {
        handlePerformLookup();
      }
    }
  };

  const handleAuthorize = () => {
    if (!currentVerification || !currentVerification.voter) return;

    if (isBoothUnlocked) {
      if (!window.confirm("The EVM booth is currently occupied with an authorized voter. Override and re-authorize?")) {
        return;
      }
    }

    const res = authorizeVoterForBooth(currentVerification.voter.studentId);
    if (res.success) {
      setFeedbackMessage({
        type: "success",
        text: `Voter ${currentVerification.voter.name} authorized! EVM Terminal is now UNLOCKED.`
      });
      // Re-query status
      const updated = verifyStudent(currentVerification.voter.studentId);
      setCurrentVerification(updated);
    } else {
      setFeedbackMessage({
        type: "error",
        text: res.message
      });
    }
  };

  const handleQuickSelect = (studentId) => {
    setInputQuery(studentId);
    handlePerformLookup(studentId);
  };

  // Recent voters to pick from
  const sampleVoters = voters.slice(0, 6);

  return (
    <div className="verification-page-container fade-in">
      {/* Top Station Header */}
      <div className="station-header-strip card-base">
        <div className="station-title-col">
          <div className="station-badge-icon">
            <ShieldCheck size={24} color="#2563eb" />
          </div>
          <div>
            <h1 className="station-heading">Verification & Polling Officer Desk</h1>
            <p className="station-subheading">
              Desk Station #01 • Verify student credentials against the official electoral roll before unlocking EVM.
            </p>
          </div>
        </div>

        {/* Live EVM Terminal Status Beacon */}
        <div className="booth-live-monitor">
          <div className="monitor-label">Linked EVM Terminal Alpha-01:</div>
          <div className={`monitor-status-box ${
            isBoothSubmitting 
              ? "monitor-submitting" 
              : isBoothUnlocked 
              ? "monitor-unlocked" 
              : "monitor-locked"
          }`}>
            <span className="live-dot" />
            <span className="monitor-status-text">
              {isBoothSubmitting ? (
                <>⏳ Recording Ballot...</>
              ) : isBoothUnlocked ? (
                <>
                  <Unlock size={14} /> UNLOCKED ({boothState.authorizedVoter?.name?.split(" ")[0]} in booth)
                </>
              ) : (
                <>
                  <Lock size={14} /> STANDBY / LOCKED (Ready for next voter)
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Search/Verification Card & Quick Roster */}
      <div className="verification-main-grid">
        {/* Left Column: Search & Verification Action */}
        <div className="verification-search-col">
          {/* Search Box */}
          <div className="verify-search-card card-base">
            <label className="search-label">
              <span>Scan or Enter Student Roll / ID Number</span>
              <span className="search-hint">Press <strong>ENTER</strong> to verify & authorize</span>
            </label>
            <div className="search-input-combo">
              <div className="combo-input-wrap">
                <Search size={20} className="combo-icon" />
                <input
                  type="text"
                  placeholder="e.g. STU-2024-001 or STU-2024-002"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="combo-input"
                  autoFocus
                />
              </div>
              <button
                onClick={() => handlePerformLookup()}
                className="btn-primary btn-combo"
              >
                Verify ID
              </button>
            </div>

            {/* Quick Test Chips */}
            <div className="quick-chips-wrap">
              <span className="chips-label">Quick Test Candidates:</span>
              <div className="chips-list">
                {sampleVoters.map((sv) => (
                  <button
                    key={sv.studentId}
                    type="button"
                    onClick={() => handleQuickSelect(sv.studentId)}
                    className={`quick-chip-btn ${sv.hasVoted ? "chip-voted" : "chip-eligible"}`}
                    title={`${sv.name} (${sv.hasVoted ? "Already Voted" : "Eligible"})`}
                  >
                    <span>{sv.studentId}</span>
                    <span className="chip-name">({sv.name.split(" ")[0]})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div className={`alert-box alert-${feedbackMessage.type} fade-in`}>
              {feedbackMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Verification Result Card */}
          {currentVerification && currentVerification.voter && (
            <div className="voter-id-card card-base fade-in">
              {/* Card Status Banner */}
              <div className={`voter-status-banner banner-${currentVerification.status.toLowerCase()}`}>
                {currentVerification.status === "ELIGIBLE" && (
                  <>
                    <CheckCircle2 size={20} />
                    <span>ELIGIBLE TO VOTE • CREDENTIALS MATCHED</span>
                  </>
                )}
                {currentVerification.status === "ALREADY_VOTED" && (
                  <>
                    <XCircle size={20} />
                    <span>ALREADY VOTED • BALLOT CAST PREVIOUSLY</span>
                  </>
                )}
                {currentVerification.status === "IN_BOOTH" && (
                  <>
                    <Unlock size={20} />
                    <span>CURRENTLY AUTHORIZED • VOTER IS IN BOOTH</span>
                  </>
                )}
              </div>

              {/* ID Details Layout */}
              <div className="voter-details-body">
                <div className="voter-photo-frame">
                  <img
                    src={currentVerification.voter.photoUrl}
                    alt={currentVerification.voter.name}
                    className="voter-large-photo"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="photo-verified-tag">
                    <ShieldCheck size={12} /> VERIFIED
                  </div>
                </div>

                <div className="voter-fields-table">
                  <div className="field-row field-row-name">
                    <span className="f-label">Student Name:</span>
                    <span className="f-val text-xl font-bold">{currentVerification.voter.name}</span>
                  </div>

                  <div className="field-row">
                    <span className="f-label">Student ID:</span>
                    <span className="f-val font-mono voter-id-highlight">
                      {currentVerification.voter.studentId}
                    </span>
                  </div>

                  <div className="field-row">
                    <span className="f-label">Father's Name:</span>
                    <span className="f-val">{currentVerification.voter.fatherName || "N/A"}</span>
                  </div>

                  <div className="field-row">
                    <span className="f-label">Academic Program:</span>
                    <span className="f-val">{currentVerification.voter.course}</span>
                  </div>

                  <div className="field-row">
                    <span className="f-label">Current Semester:</span>
                    <span className="f-val">{currentVerification.voter.semester}</span>
                  </div>

                  {currentVerification.voter.hasVoted && (
                    <div className="field-row field-voted-stamp">
                      <span className="f-label">Vote Timestamp:</span>
                      <span className="f-val text-danger">
                        <Clock size={13} /> {new Date(currentVerification.voter.votedAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="voter-card-actions">
                {currentVerification.status === "ELIGIBLE" && (
                  <button
                    onClick={handleAuthorize}
                    className="btn-success btn-large btn-authorize"
                  >
                    <Unlock size={20} />
                    <span>AUTHORIZE FOR VOTING BOOTH (ENTER)</span>
                    <ArrowRight size={18} />
                  </button>
                )}

                {currentVerification.status === "IN_BOOTH" && (
                  <div className="in-booth-actions">
                    <div className="booth-active-note">
                      <Radio size={16} className="text-emerald animate-pulse" />
                      <span>EVM terminal is currently displaying ballot for this voter.</span>
                    </div>
                    <button
                      onClick={cancelBoothAuthorization}
                      className="btn-secondary text-danger"
                    >
                      <RotateCcw size={15} /> Revoke Authorization
                    </button>
                  </div>
                )}

                {currentVerification.status === "ALREADY_VOTED" && (
                  <div className="alert-box alert-error full-width">
                    <AlertTriangle size={18} />
                    <span>This student has already exercised their voting franchise. No duplicate voting permitted.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Not Found State */}
          {currentVerification && currentVerification.status === "NOT_FOUND" && (
            <div className="not-found-card card-base fade-in">
              <XCircle size={36} color="#dc2626" />
              <h3>Student ID Not Found in Electoral Roll</h3>
              <p>
                No student record matches <strong>"{inputQuery}"</strong>. Please verify the ID card or contact the 
                Chief Electoral Officer at the Admin Control Desk.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Station Overview & Real-Time Booth Telemetry */}
        <div className="verification-info-col">
          {/* Booth Telemetry Card */}
          <div className="station-info-card card-base">
            <h3 className="card-subheading">EVM Terminal Booth Live State</h3>
            <div className="booth-telemetry-box">
              <div className="telemetry-row">
                <span className="t-label">Booth Terminal ID:</span>
                <span className="t-val font-mono">{boothState.activeBoothId || "BOOTH-ALPHA-01"}</span>
              </div>
              <div className="telemetry-row">
                <span className="t-label">Current Lock State:</span>
                <span className={`badge ${isBoothUnlocked ? "badge-success" : "badge-neutral"}`}>
                  {isBoothUnlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <div className="telemetry-row">
                <span className="t-label">Voter in Booth:</span>
                <span className="t-val font-semibold">
                  {boothState.authorizedVoter ? boothState.authorizedVoter.name : "None (Booth Standing By)"}
                </span>
              </div>
              {boothState.authorizedAt && (
                <div className="telemetry-row">
                  <span className="t-label">Authorized At:</span>
                  <span className="t-val">
                    {new Date(boothState.authorizedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {isBoothUnlocked && (
              <button
                onClick={cancelBoothAuthorization}
                className="btn-secondary btn-sm mt-3 full-width text-danger"
              >
                <Lock size={14} /> Force Lock EVM Terminal
              </button>
            )}
          </div>

          {/* Polling Station Quick Instructions */}
          <div className="station-instructions-card card-base">
            <h3 className="card-subheading">Polling Protocol Guidelines</h3>
            <ul className="guidelines-list">
              <li>
                <span className="step-num">1</span>
                <span>Check the physical Student ID Card against the student photograph on screen.</span>
              </li>
              <li>
                <span className="step-num">2</span>
                <span>Ensure the father's name, department, and semester match student records.</span>
              </li>
              <li>
                <span className="step-num">3</span>
                <span>Click <strong>"Authorize for Voting Booth"</strong> or press <strong>ENTER</strong>.</span>
              </li>
              <li>
                <span className="step-num">4</span>
                <span>Guide the student into the private EVM voting compartment.</span>
              </li>
              <li>
                <span className="step-num">5</span>
                <span>The terminal will automatically lock itself once the student submits their vote.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
