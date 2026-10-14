import React, { useState, useEffect, useRef } from "react";
import { 
  Lock, 
  Unlock, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Vote, 
  Radio,
  Maximize2,
  Minimize2
} from "lucide-react";
import confetti from "canvas-confetti";
import { useElection } from "../../context/ElectionContext";
import { soundManager } from "../../utils/sound";
import { DEFAULT_AVATAR } from "../../utils/constants";
import { candidatePhotos } from "../../data/candidatePhotos";

export const EVMPanel = ({ userSession }) => {
  const { electionConfig, positions, candidates, castBallot, cancelBoothAuthorization, booths, initialBooths } = useElection();

  const allBooths = booths && Array.isArray(booths) && booths.length > 0 ? booths : (initialBooths || []);
  const selectedBoothId = userSession?.boothId || localStorage.getItem("active_evm_booth_id") || "BOOTH-1";

  const activeBooth = allBooths.find((b) => b.id === selectedBoothId) || allBooths[0] || electionConfig.boothState || {};
  const isUnlocked = activeBooth.status === "UNLOCKED";
  const isSubmitting = activeBooth.status === "SUBMITTING";
  const authorizedVoter = activeBooth.authorizedVoter;

  // Track the voter ID to prevent reset when the same voter is in progress
  const lastAuthorizedVoterIdRef = useRef(null);

  // EVM Internal flow:
  // "WELCOME" -> "VOTING" -> "REVIEW" -> "SUCCESS"
  const [evmStep, setEvmStep] = useState("WELCOME");
  const [currentPosIndex, setCurrentPosIndex] = useState(0);
  const [ballotSelections, setBallotSelections] = useState({}); // { [positionId]: candidateId | 'NOTA' }
  const [countdown, setCountdown] = useState(electionConfig.autoLockDelaySeconds || 4);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen toggle helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard shortcut [F] for Fullscreen & listener for changes
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    window.addEventListener("keydown", handleKey);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  // When booth unlocks from the verification desk, initialize EVM state ONLY for a new voter
  useEffect(() => {
    if (isUnlocked && authorizedVoter?.studentId) {
      if (lastAuthorizedVoterIdRef.current !== authorizedVoter.studentId) {
        lastAuthorizedVoterIdRef.current = authorizedVoter.studentId;
        setEvmStep("WELCOME");
        setCurrentPosIndex(0);
        setBallotSelections({});
      }
    } else if (!isUnlocked && !isSubmitting) {
      lastAuthorizedVoterIdRef.current = null;
    }
  }, [isUnlocked, authorizedVoter?.studentId]);

  // CRITICAL FIX: Handle countdown when vote is submitted, auto-reset when finished
  useEffect(() => {
    let timer = null;
    if (isSubmitting || evmStep === "SUCCESS") {
      setCountdown(electionConfig.autoLockDelaySeconds || 4);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            lastAuthorizedVoterIdRef.current = null;
            // Reset EVM state back to standby welcome & clear selections
            setEvmStep("WELCOME");
            setBallotSelections({});
            setCurrentPosIndex(0);
            if (isSubmitting) {
              cancelBoothAuthorization(activeBooth.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSubmitting, evmStep, electionConfig.autoLockDelaySeconds, activeBooth.id]);

  // If booth gets locked externally or through timeout, guarantee EVM resets
  useEffect(() => {
    if (!isUnlocked && !isSubmitting) {
      if (evmStep === "SUCCESS") {
        lastAuthorizedVoterIdRef.current = null;
        setEvmStep("WELCOME");
        setBallotSelections({});
        setCurrentPosIndex(0);
      }
    }
  }, [isUnlocked, isSubmitting, evmStep]);

  // Candidate selection handler
  const handleSelectCandidate = (posId, candidateId) => {
    soundManager.playSelectBeep();
    setBallotSelections((prev) => ({
      ...prev,
      [posId]: candidateId
    }));
  };

  // Move to next position in sequence
  const handleNextPosition = () => {
    if (currentPosIndex < positions.length - 1) {
      setCurrentPosIndex((prev) => prev + 1);
    } else {
      setEvmStep("REVIEW");
    }
  };

  // Move back
  const handlePrevPosition = () => {
    if (currentPosIndex > 0) {
      setCurrentPosIndex((prev) => prev - 1);
    } else {
      setEvmStep("WELCOME");
    }
  };

  // Final Cast Ballot
  const handleFinalSubmit = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    lastAuthorizedVoterIdRef.current = null;
    setEvmStep("SUCCESS");
    castBallot(ballotSelections, activeBooth.id);
  };

  // -------------------------------------------------------------
  // RENDER 1: LOCKED STANDBY SCREEN
  // -------------------------------------------------------------
  // CRITICAL GUARD: Never lock out a voter who is actively in the middle of VOTING or REVIEW
  // for the currently authorized session!
  const isActivelyVoting = (evmStep === "VOTING" || evmStep === "REVIEW") && !!authorizedVoter;

  if (!isUnlocked && !isActivelyVoting && (!isSubmitting || countdown <= 0) && (evmStep !== "SUCCESS" || countdown <= 0)) {
    return (
      <div className={`evm-terminal-container evm-locked-screen fade-in ${isFullscreen ? "fullscreen-terminal" : ""}`}>
        <div className="evm-lock-beacon-card card-base">
          <div className="evm-lock-icon-wrap">
            <Lock size={64} className="lock-icon-pulse" />
          </div>

          <div className="evm-status-title">EVM TERMINAL IS LOCKED</div>
          <div className="evm-booth-id">
            TERMINAL STATION: <strong>{activeBooth.name || activeBooth.shortName || activeBooth.id}</strong>
          </div>

          <div className="evm-lock-instructions">
            <p>
              Please present your official Student ID card at the <strong>Verification Desk</strong>.
            </p>
            <p className="evm-lock-subtext">
              The Polling Officer will verify your electoral eligibility and unlock this terminal (<strong>{activeBooth.shortName || activeBooth.name}</strong>) automatically.
            </p>
          </div>

          <div className="evm-listening-indicator">
            <Radio size={16} className="radio-pulse" />
            <span>Listening for real-time signal on {activeBooth.shortName || activeBooth.name}...</span>
          </div>

          <div className="evm-security-seal">
            <ShieldCheck size={16} />
            <span>Graphic Era Hill University • College of Nursing • SNA Elections 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: SUCCESS / AUTO-LOCKDOWN SCREEN
  // -------------------------------------------------------------
  if ((isSubmitting || evmStep === "SUCCESS") && countdown > 0) {
    return (
      <div className={`evm-terminal-container evm-success-screen fade-in ${isFullscreen ? "fullscreen-terminal" : ""}`}>
        <div className="evm-success-card card-base">
          <div className="success-icon-wrap">
            <CheckCircle2 size={72} color="#059669" />
          </div>

          <h2 className="success-title">OFFICIAL BALLOT RECORDED SECURELY</h2>
          <div className="success-voter-name">
            Thank you, {authorizedVoter?.name || "Voter"}!
          </div>

          <div className="digital-vvpat-slip card-base">
            <div className="vvpat-header">
              <Vote size={18} />
              <span>DIGITAL VVPAT BALLOT RECEIPT</span>
            </div>
            <div className="vvpat-details">
              <div className="vvpat-row">
                <span>Voter Roll ID:</span>
                <span className="font-mono">{authorizedVoter?.studentId}</span>
              </div>
              <div className="vvpat-row">
                <span>Positions Voted:</span>
                <span>{positions.length} of {positions.length} Completed</span>
              </div>
              <div className="vvpat-row">
                <span>Timestamp:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="vvpat-row">
                <span>Status:</span>
                <span className="text-emerald font-bold">LOCKED & RECORDED</span>
              </div>
            </div>
          </div>

          {/* Auto-lock timer */}
          <div className="auto-lock-countdown">
            <div className="countdown-ring">{countdown}</div>
            <p>
              Terminal resetting and auto-locking for the next voter in <strong>{countdown}</strong> seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Current Position in Ballot Sequence
  const safePosIndex = Math.min(Math.max(0, currentPosIndex), Math.max(0, positions.length - 1));
  const currentPos = positions[safePosIndex] || positions[0];

  if (!currentPos || positions.length === 0) {
    return (
      <div className="evm-terminal-container evm-locked-screen fade-in">
        <div className="evm-lock-beacon-card card-base">
          <div className="evm-lock-icon-wrap">
            <Lock size={64} className="lock-icon-pulse" />
          </div>
          <div className="evm-status-title">NO ELECTORAL POSTS CONFIGURED</div>
          <p className="evm-lock-instructions">
            Please ask the Election Administrator to configure electoral positions in the Admin Console.
          </p>
        </div>
      </div>
    );
  }

  const currentPosCandidates = candidates
    .filter((c) => c.positionId === currentPos.id)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  const selectedCandForPos = ballotSelections[currentPos.id];

  // -------------------------------------------------------------
  // RENDER 3: WELCOME INDUCTION SCREEN
  // -------------------------------------------------------------
  if (evmStep === "WELCOME") {
    return (
      <div className={`evm-terminal-container evm-welcome-screen fade-in ${isFullscreen ? "fullscreen-terminal" : ""}`}>
        <div className="evm-induction-card card-base">
          <div className="induction-top-badge">
            <Unlock size={18} />
            <span>Terminal Authorized & Ready to Vote</span>
          </div>

          <div className="induction-profile-row">
            <img
              src={authorizedVoter?.photoUrl || DEFAULT_AVATAR}
              alt={authorizedVoter?.name}
              className="induction-photo"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <div className="induction-text">
              <span className="induction-greeting">Authorized Voter</span>
              <h2 className="induction-name">{authorizedVoter?.name}</h2>
              <div className="induction-meta-tags">
                <span className="meta-tag font-mono">ID: {authorizedVoter?.studentId}</span>
                <span className="meta-tag">{authorizedVoter?.course || "B.Sc. Nursing"}</span>
                <span className="meta-tag">{authorizedVoter?.year} ({authorizedVoter?.semester})</span>
              </div>
            </div>
          </div>

          <div className="induction-instructions card-base">
            <h4>Official EVM Voting Instructions</h4>
            <ol>
              <li>Cast your vote for <strong>{positions.length} electoral positions</strong> one by one.</li>
              <li>Press the blue voting button next to your chosen candidate (or select NOTA).</li>
              <li>Review your complete ballot summary on the final review screen.</li>
              <li>Once confirmed, your ballot is permanently encrypted and the EVM terminal locks.</li>
            </ol>
          </div>

          <button
            id="btn-proceed-to-ballot"
            onClick={() => setEvmStep("VOTING")}
            className="btn-primary btn-large btn-begin-ballot"
          >
            <span>Proceed to Step 1: {positions[0]?.title}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 4: BALLOT REVIEW SCREEN
  // -------------------------------------------------------------
  if (evmStep === "REVIEW") {
    return (
      <div className={`evm-terminal-container evm-review-screen fade-in ${isFullscreen ? "fullscreen-terminal" : ""}`}>
        <div className="evm-ballot-card card-base">
          <div className="ballot-header">
            <div>
              <span className="badge badge-blue">Final Step</span>
              <h2 className="ballot-title">Review Your Official Ballot</h2>
              <p className="ballot-subtitle">
                Please verify your selections for each post before permanent submission.
              </p>
            </div>
          </div>

          <div className="review-list">
            {positions.map((pos) => {
              const choiceId = ballotSelections[pos.id];
              const cand = candidates.find((c) => c.id === choiceId);
              const isNota = choiceId === "NOTA";

              return (
                <div key={pos.id} className="review-row-item card-base">
                  <div className="review-pos-col">
                    <span className="review-step-label">Step #{pos.sequence}</span>
                    <h4 className="review-pos-title">{pos.title}</h4>
                  </div>

                  <div className="review-choice-col">
                    {cand ? (
                      <div className="review-selected-cand">
                        <img 
                          src={
                            cand.avatarUrl &&
                            cand.avatarUrl !== DEFAULT_AVATAR &&
                            !cand.avatarUrl.startsWith("data:image/svg+xml")
                              ? cand.avatarUrl
                              : candidatePhotos[cand.id] || DEFAULT_AVATAR
                          } 
                          alt={cand.name} 
                          style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                          onError={(e) => {
                            if (candidatePhotos[cand.id]) {
                              e.target.src = candidatePhotos[cand.id];
                            } else {
                              e.target.src = DEFAULT_AVATAR;
                            }
                          }}
                        />
                        <div>
                          <div className="review-cand-name">{cand.name}</div>
                          <div className="review-cand-dept">{cand.department}{cand.symbolName ? ` • ${cand.symbolName}` : ""}</div>
                        </div>
                      </div>
                    ) : isNota ? (
                      <div className="review-selected-cand text-muted">
                        <span className="review-cand-symbol">🚫</span>
                        <div>
                          <div className="review-cand-name">NOTA (None of the Above)</div>
                          <div className="review-cand-dept">Did not vote for any candidate</div>
                        </div>
                      </div>
                    ) : (
                      <div className="review-unselected-warning">
                        <AlertCircle size={16} />
                        <span>No selection made</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="review-actions-bar">
            <button
              onClick={() => {
                setCurrentPosIndex(0);
                setEvmStep("VOTING");
              }}
              className="btn-secondary"
            >
              <ChevronLeft size={16} /> Modify Selections
            </button>

            <button
              id="btn-cast-official-ballot"
              onClick={handleFinalSubmit}
              className="btn-success btn-large btn-cast-official"
            >
              <Check size={22} />
              <span>CONFIRM & CAST OFFICIAL BALLOT</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 5: SEQUENTIAL POSITION BALLOT (VOTING STEP)
  // -------------------------------------------------------------
  return (
    <div className={`evm-terminal-container evm-ballot-screen fade-in ${isFullscreen ? "fullscreen-terminal" : ""}`}>
      <div className="evm-ballot-card card-base">
        {/* Stepper Progress Bar */}
        <div className="ballot-stepper-header">
          <div className="stepper-meta">
            <span className="badge badge-blue">
              Position {currentPosIndex + 1} of {positions.length}
            </span>
            <span className="voter-badge-pill">
              Voter: <strong>{authorizedVoter?.name}</strong> ({authorizedVoter?.studentId})
            </span>
          </div>

          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentPosIndex + 1) / positions.length) * 100}%` }}
            />
          </div>

          <div className="position-title-box">
            <h2 className="current-pos-title">{currentPos.title}</h2>
            <p className="current-pos-desc">
              {currentPos.description || "Select one candidate or NOTA to represent this office"}
            </p>
          </div>
        </div>

        {/* Candidate EVM Tiles */}
        <div className="evm-candidates-grid">
          {currentPosCandidates.map((cand) => {
            const isSelected = selectedCandForPos === cand.id;

            return (
              <div
                key={cand.id}
                onClick={() => handleSelectCandidate(currentPos.id, cand.id)}
                className={`evm-candidate-tile card-base ${isSelected ? "cand-tile-selected" : ""}`}
              >
                {/* Photo & Symbol */}
                <div className="tile-profile-section">
                  <img
                    src={
                      cand.avatarUrl &&
                      cand.avatarUrl !== DEFAULT_AVATAR &&
                      !cand.avatarUrl.startsWith("data:image/svg+xml")
                        ? cand.avatarUrl
                        : candidatePhotos[cand.id] || DEFAULT_AVATAR
                    }
                    alt={cand.name}
                    className="tile-avatar"
                    onError={(e) => {
                      if (candidatePhotos[cand.id]) {
                        e.target.src = candidatePhotos[cand.id];
                      } else {
                        e.target.src = DEFAULT_AVATAR;
                      }
                    }}
                  />
                  {cand.symbolName ? (
                    <div className="tile-symbol-box" title={`Symbol: ${cand.symbolName}`}>
                      <span className="tile-symbol-icon">{cand.symbolIcon}</span>
                      <span className="tile-symbol-name">{cand.symbolName}</span>
                    </div>
                  ) : null}
                </div>

                {/* Candidate Info */}
                <div className="tile-info-section">
                  <h3 className="tile-cand-name">{cand.name}</h3>
                  <div className="tile-cand-sub">
                    <span>{cand.rollNo}</span>
                    <span className="dot-sep">•</span>
                    <span>{cand.department}</span>
                  </div>
                  {cand.manifesto && (
                    <p className="tile-cand-manifesto">"{cand.manifesto}"</p>
                  )}
                </div>

                {/* Tactile EVM Blue Button with LED indicator */}
                <div className="tile-evm-button-section">
                  <div className={`evm-led ${isSelected ? "led-active" : ""}`} />
                  <button
                    type="button"
                    className={`evm-vote-press-btn ${isSelected ? "btn-pressed" : ""}`}
                  >
                    {isSelected ? <Check size={20} /> : <span className="press-label">VOTE</span>}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty candidates notification */}
          {currentPosCandidates.length === 0 && (
            <div 
              className="card-base text-center" 
              style={{ 
                gridColumn: "1 / -1", 
                padding: "2rem 1.5rem", 
                background: "rgba(255,255,255,0.03)", 
                border: "1px dashed rgba(255,255,255,0.18)", 
                borderRadius: "14px" 
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.4rem" }}>
                No Candidates Nominated Yet for This Post
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                You may register NOTA below or proceed directly to the next ballot position.
              </p>
            </div>
          )}

          {/* NOTA Option */}
          {currentPos.allowNota !== false && (
            <div
              onClick={() => handleSelectCandidate(currentPos.id, "NOTA")}
              className={`evm-candidate-tile evm-nota-tile card-base ${
                selectedCandForPos === "NOTA" ? "cand-tile-selected" : ""
              }`}
            >
              <div className="tile-profile-section">
                <div className="nota-icon-box">🚫</div>
                <div className="tile-symbol-box">
                  <span className="tile-symbol-name">NOTA</span>
                </div>
              </div>

              <div className="tile-info-section">
                <h3 className="tile-cand-name">None of the Above (NOTA)</h3>
                <p className="tile-cand-manifesto text-muted">
                  I choose not to vote for any of the nominated candidates for this post.
                </p>
              </div>

              <div className="tile-evm-button-section">
                <div className={`evm-led ${selectedCandForPos === "NOTA" ? "led-active" : ""}`} />
                <button
                  type="button"
                  className={`evm-vote-press-btn ${selectedCandForPos === "NOTA" ? "btn-pressed" : ""}`}
                >
                  {selectedCandForPos === "NOTA" ? <Check size={20} /> : <span className="press-label">NOTA</span>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="ballot-nav-bar">
          <button
            onClick={handlePrevPosition}
            className="btn-secondary btn-large"
          >
            <ChevronLeft size={18} />
            <span>{currentPosIndex === 0 ? "Back to Welcome" : "Previous Post"}</span>
          </button>

          <button
            id="btn-next-position"
            onClick={handleNextPosition}
            disabled={!selectedCandForPos && currentPosCandidates.length > 0}
            className="btn-primary btn-large"
          >
            <span>
              {currentPosIndex === positions.length - 1 ? "Review Full Ballot" : "Next Position"}
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
