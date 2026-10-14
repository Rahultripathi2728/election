import React, { useState, useEffect, useMemo } from "react";
import { 
  Award, 
  Users, 
  Vote, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Clock, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Building, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  CheckCircle2
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { DEFAULT_AVATAR } from "../../utils/constants";
import { candidatePhotos } from "../../data/candidatePhotos";
import gehuLogo from "../../assets/gehu_logo.png";
import snaLogo from "../../assets/sna_logo.png";

export const LiveResultsPanel = ({ onOpenLogin, isStaffPreview = false, onReturnToStation }) => {
  const { electionConfig, positions, candidates, voters, ballots, booths, initialBooths } = useElection();
  
  const allBooths = booths && Array.isArray(booths) && booths.length > 0 ? booths : (initialBooths || []);
  
  const [selectedPostFilter, setSelectedPostFilter] = useState("ALL");
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(new Date());

  // Real-time clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scheduled Start Time: 3:00 PM (15:00 IST) today
  const targetPollTime = useMemo(() => {
    const d = new Date();
    d.setHours(15, 0, 0, 0);
    return d;
  }, []);

  const diffMs = targetPollTime.getTime() - now.getTime();
  const countdownHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const countdownMinutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
  const countdownSeconds = Math.max(0, Math.floor((diffMs % (1000 * 60)) / 1000));

  // Determine Active Stage: "PRE_POLL" | "LIVE_POLL" | "CONCLUDED"
  // Default to electionConfig.electionStage, falling back to electionConfig.status
  const stage = electionConfig.electionStage || (electionConfig.status === "CONCLUDED" ? "CONCLUDED" : "LIVE_POLL");

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

  const filteredPositions = selectedPostFilter === "ALL"
    ? positions
    : positions.filter((p) => p.id === selectedPostFilter);

  return (
    <div className={`live-results-container fade-in ${isFullscreen ? "fullscreen-mode" : ""}`} style={{ maxWidth: "1400px", margin: "0 auto", padding: "16px 20px" }}>
      {/* Staff Preview Return Banner */}
      {isStaffPreview && (
        <div style={{
          background: "#1e293b",
          color: "#ffffff",
          padding: "8px 16px",
          borderRadius: "10px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.82rem"
        }}>
          <span>👁️ Staff Preview: You are viewing the public portal as students and faculty see it.</span>
          {onReturnToStation && (
            <button
              onClick={onReturnToStation}
              style={{
                background: "#3b82f6",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Return to Station Console →
            </button>
          )}
        </div>
      )}

      {/* 1. PUBLIC AUDITORIUM & WEB HERO HEADER (WITH OFFICIAL UNIVERSITY & SNA LOGOS) */}
      <div className="card-base" style={{
        padding: "16px 24px",
        borderRadius: "16px",
        background: "#ffffff",
        border: "1.5px solid var(--border-light)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        {/* Left: Graphic Era Hill University Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src={gehuLogo}
            alt="Graphic Era Hill University Logo"
            style={{
              width: "62px",
              height: "62px",
              objectFit: "contain",
              borderRadius: "50%",
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: "2px"
            }}
          />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
              <span style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
                padding: "2px 8px",
                borderRadius: "20px",
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase"
              }}>
                {electionConfig.institution || "Graphic Era Hill University"} • {electionConfig.department || "College of Nursing"}
              </span>
            </div>

            <h1 style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--primary-navy)",
              lineHeight: 1.2
            }}>
              {electionConfig.title || "SNA Student Nursing Council Elections 2026"}
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Student Nurses' Association of India • Official Campus Electoral Portal
            </p>
          </div>
        </div>

        {/* Right: SNA Logo + Staff / Admin Login Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img
            src={snaLogo}
            alt="Student Nurses Association of India Logo"
            style={{
              width: "62px",
              height: "62px",
              objectFit: "contain",
              borderRadius: "50%",
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: "2px"
            }}
          />

          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 18px",
                borderRadius: "10px",
                fontWeight: 800,
                fontSize: "0.88rem",
                boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                cursor: "pointer"
              }}
              title="Official Station Login (Chief Electoral Officer, Verification Desk, EVM Booths)"
            >
              <Lock size={16} />
              <span>Staff / Station Login</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="btn-secondary"
            style={{ padding: "9px 12px", borderRadius: "10px" }}
            title={isFullscreen ? "Exit Fullscreen" : "Projector Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC STAGE BANNER (CONTROLLED BY ADMIN) */}
      {/* STAGE A: PRE-POLL COUNTDOWN */}
      {stage === "PRE_POLL" && (
        <div className="card-base fade-in" style={{
          padding: "18px 24px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          color: "#ffffff",
          boxShadow: "0 8px 24px rgba(49, 46, 129, 0.2)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Clock size={18} color="#f59e0b" />
              <span style={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.06em", color: "#fef3c7", textTransform: "uppercase" }}>
                ⏳ Pre-Poll Countdown • Official Polling Begins Today at 3:00 PM (15:00 IST)
              </span>
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e0e7ff" }}>
              Graphic Era Hill University • College of Nursing SNA Elections
            </div>
            <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: "2px" }}>
              Review the nominated student contestants and manifestos below. 3 EVM terminals will open at 3:00 PM.
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "8px 14px", borderRadius: "10px", minWidth: "64px" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, fontFamily: "monospace", color: "#fbbf24", lineHeight: 1 }}>
                {String(countdownHours).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#e2e8f0", marginTop: "3px" }}>Hours</div>
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fbbf24" }}>:</span>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "8px 14px", borderRadius: "10px", minWidth: "64px" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, fontFamily: "monospace", color: "#fbbf24", lineHeight: 1 }}>
                {String(countdownMinutes).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#e2e8f0", marginTop: "3px" }}>Minutes</div>
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fbbf24" }}>:</span>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", padding: "8px 14px", borderRadius: "10px", minWidth: "64px" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, fontFamily: "monospace", color: "#38bdf8", lineHeight: 1 }}>
                {String(countdownSeconds).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#e2e8f0", marginTop: "3px" }}>Seconds</div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE B: VOTING IS LIVE (COUNTDOWN REMOVED AS REQUESTED) */}
      {stage === "LIVE_POLL" && (
        <div className="card-base fade-in" style={{
          padding: "16px 24px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
          color: "#ffffff",
          boxShadow: "0 8px 24px rgba(6, 78, 59, 0.25)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="live-dot" style={{ background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.06em", color: "#bbf7d0", textTransform: "uppercase" }}>
                🟢 VOTING IS LIVE & IN PROGRESS
              </span>
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
              Official Student Polling Underway Across All 3 EVM Booths
            </div>
            <div style={{ fontSize: "0.82rem", color: "#a7f3d0", marginTop: "2px" }}>
              Please present your official Student ID card at the Verification Desk to cast your vote.
            </div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
            padding: "8px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700, color: "#d1fae5" }}>EVM Terminals</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>3 Booths Active</div>
          </div>
        </div>
      )}

      {/* STAGE C: ELECTION CONCLUDED / FINAL RESULTS & WINNERS DECLARED */}
      {stage === "CONCLUDED" && (
        <div className="card-base fade-in" style={{
          padding: "20px 26px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)",
          color: "#ffffff",
          boxShadow: "0 8px 30px rgba(180, 83, 9, 0.35)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Award size={22} color="#fef08a" />
              <span style={{ fontSize: "0.82rem", fontWeight: 800, letterSpacing: "0.06em", color: "#fef08a", textTransform: "uppercase" }}>
                🏆 OFFICIAL ELECTION RESULTS DECLARED
              </span>
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#ffffff", marginTop: "4px" }}>
              Certified Winners • SNA Student Nursing Council 2026-2027
            </div>
            <div style={{ fontSize: "0.85rem", color: "#fef3c7", marginTop: "2px" }}>
              Official balloting has concluded and all results have been sealed and certified by the Chief Electoral Officer.
            </div>
          </div>

          <div style={{
            background: "rgba(0,0,0,0.25)",
            padding: "10px 20px",
            borderRadius: "12px",
            border: "1.5px solid rgba(255,255,255,0.3)",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#fef08a", display: "block" }}>CERTIFIED</span>
            <div style={{ fontSize: "0.72rem", color: "#fed7aa", fontWeight: 700, textTransform: "uppercase" }}>Official Declaration</div>
          </div>
        </div>
      )}

      {/* 3. PERIODIC MID-POLL BULLETIN (ADMIN BROADCASTS EVERY 15-20 MINS) */}
      {electionConfig.activeBulletin && (
        <div className="card-base fade-in" style={{
          padding: "16px 20px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          border: "2px solid #3b82f6",
          boxShadow: "0 4px 16px rgba(59, 130, 246, 0.15)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Radio size={22} className="radio-pulse" />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  📢 OFFICIAL ELECTION COMMISSION BULLETIN
                </span>
                <span style={{ fontSize: "0.72rem", background: "#bfdbfe", color: "#1e3a8a", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
                  Posted at {electionConfig.activeBulletin.postedAt}
                </span>
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                {electionConfig.activeBulletin.title}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.4 }}>
                {electionConfig.activeBulletin.message}
              </p>
            </div>
          </div>

          {electionConfig.activeBulletin.turnoutPercent && (
            <div style={{
              background: "#ffffff",
              border: "1.5px solid #93c5fd",
              padding: "8px 16px",
              borderRadius: "10px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#2563eb" }}>
                {electionConfig.activeBulletin.turnoutPercent}%
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Verified Polling Turnout
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: HALL OF WINNERS (SHOWN ONLY WHEN CONCLUDED) */}
      {/* ======================================================== */}
      {stage === "CONCLUDED" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
          <div style={{ textAlign: "center", marginBottom: "4px" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--primary-navy)", margin: 0 }}>
              Official Certified Council Winners 2026-2027
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Student Nurses' Association (SNA) Executive Council • Graphic Era Hill University
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "20px" }}>
            {positions.map((pos) => {
              const posCandidates = candidates
                .filter((c) => c.positionId === pos.id)
                .sort((a, b) => (b.votes || 0) - (a.votes || 0));

              const winner = posCandidates[0];
              const runnerUp = posCandidates[1];
              const totalVotes = posCandidates.reduce((s, c) => s + (c.votes || 0), 0);
              const margin = winner && runnerUp ? (winner.votes || 0) - (runnerUp.votes || 0) : winner?.votes || 0;

              const winnerImg = winner ? ((winner.avatarUrl && winner.avatarUrl !== DEFAULT_AVATAR && !winner.avatarUrl.startsWith("data:image/svg+xml")) ? winner.avatarUrl : candidatePhotos[winner.id] || DEFAULT_AVATAR) : DEFAULT_AVATAR;

              return (
                <div key={pos.id} className="card-base" style={{
                  padding: "24px",
                  borderRadius: "16px",
                  border: "2px solid #f59e0b",
                  background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
                  boxShadow: "0 8px 24px rgba(245, 158, 11, 0.15)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Gold Corner Ribbon */}
                  <div style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <span>👑 WINNER ELECT</span>
                  </div>

                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    OFFICE OF THE {pos.title.toUpperCase()}
                  </div>
                  <h3 style={{ margin: "2px 0 16px", fontSize: "1.25rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                    {pos.title}
                  </h3>

                  {winner ? (
                    <div>
                      {/* Winner Highlight Box */}
                      <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ position: "relative" }}>
                          <img
                            src={winnerImg}
                            alt={winner.name}
                            style={{
                              width: "84px",
                              height: "84px",
                              borderRadius: "16px",
                              objectFit: "cover",
                              border: "3px solid #f59e0b",
                              boxShadow: "0 6px 16px rgba(245, 158, 11, 0.25)"
                            }}
                            onError={(e) => {
                              if (candidatePhotos[winner.id]) e.target.src = candidatePhotos[winner.id];
                              else e.target.src = DEFAULT_AVATAR;
                            }}
                          />
                          <span style={{
                            position: "absolute",
                            bottom: "-8px",
                            right: "-8px",
                            background: "#fef08a",
                            border: "1.5px solid #d97706",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.95rem"
                          }}>
                            👑
                          </span>
                        </div>

                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "var(--primary-navy)" }}>
                            {winner.name}
                          </h4>
                          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                            <strong style={{ fontFamily: "monospace", color: "#2563eb" }}>{winner.rollNo}</strong> • {winner.department}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {winner.year}
                          </div>

                          <div style={{ marginTop: "6px" }}>
                            <span style={{
                              background: "#ecfdf5",
                              border: "1px solid #a7f3d0",
                              color: "#047857",
                              fontSize: "0.78rem",
                              fontWeight: 800,
                              padding: "2px 8px",
                              borderRadius: "6px"
                            }}>
                              Won with {winner.votes || 0} Votes {margin > 0 && runnerUp ? `(+${margin} lead)` : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Certified Standing Summary */}
                      <div style={{
                        background: "#ffffff",
                        border: "1px solid #fde68a",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontSize: "0.8rem"
                      }}>
                        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: "6px" }}>
                          Certified Final Standings:
                        </div>
                        {posCandidates.map((cand, cIdx) => (
                          <div key={cand.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: cIdx < posCandidates.length - 1 ? "1px dashed #f1f5f9" : "none" }}>
                            <span>{cIdx + 1}. {cand.name}</span>
                            <strong>{cand.votes || 0} votes ({totalVotes > 0 ? ((cand.votes / totalVotes) * 100).toFixed(1) : 0}%)</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No candidates nominated.</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: OFFICIAL CONTESTING CANDIDATES & MANIFESTOS */}
      {/* ======================================================== */}
      <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Navigation & Search Strip */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid var(--border-light)",
          paddingBottom: "12px",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--primary-navy)" }}>
              {stage === "CONCLUDED" ? "All Nominated Candidates Reference" : "Nominated Candidates & Manifestos"}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Official roster of contesting student candidates across all electoral offices
            </p>
          </div>

          {/* Position Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Post:</span>
            <button
              onClick={() => setSelectedPostFilter("ALL")}
              style={{
                border: "none",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "0.78rem",
                fontWeight: selectedPostFilter === "ALL" ? 800 : 600,
                cursor: "pointer",
                background: selectedPostFilter === "ALL" ? "#2563eb" : "#f1f5f9",
                color: selectedPostFilter === "ALL" ? "#ffffff" : "var(--text-secondary)"
              }}
            >
              All
            </button>
            {positions.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPostFilter(p.id)}
                style={{
                  border: "none",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "0.78rem",
                  fontWeight: selectedPostFilter === p.id ? 800 : 600,
                  cursor: "pointer",
                  background: selectedPostFilter === p.id ? "#2563eb" : "#f1f5f9",
                  color: selectedPostFilter === p.id ? "#ffffff" : "var(--text-secondary)",
                  whiteSpace: "nowrap"
                }}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Positions & Candidate Cards */}
        {filteredPositions.map((pos) => {
          const posCandidates = candidates.filter((c) => c.positionId === pos.id);
          return (
            <div key={pos.id} className="card-base" style={{ padding: "20px", borderRadius: "14px", border: "1.5px solid var(--border-light)" }}>
              {/* Position Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "10px", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2563eb", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    ELECTORAL OFFICE #{pos.sequence}
                  </span>
                  <h3 style={{ margin: "2px 0 0", fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                    {pos.title}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {pos.description}
                  </p>
                </div>
                <span style={{
                  background: "#f1f5f9",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)"
                }}>
                  {posCandidates.length} Nominees Contesting
                </span>
              </div>

              {/* Candidates Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
                {posCandidates.map((cand) => {
                  const imgSrc = (cand.avatarUrl && cand.avatarUrl !== DEFAULT_AVATAR && !cand.avatarUrl.startsWith("data:image/svg+xml"))
                    ? cand.avatarUrl
                    : candidatePhotos[cand.id] || DEFAULT_AVATAR;

                  return (
                    <div
                      key={cand.id}
                      className="card-base"
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border-light)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background: "#ffffff",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div>
                        {/* Candidate Top Row */}
                        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div style={{ position: "relative" }}>
                            <img
                              src={imgSrc}
                              alt={cand.name}
                              style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "12px",
                                objectFit: "cover",
                                border: "2px solid var(--border-light)",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.06)"
                              }}
                              onError={(e) => {
                                if (candidatePhotos[cand.id]) e.target.src = candidatePhotos[cand.id];
                                else e.target.src = DEFAULT_AVATAR;
                              }}
                            />
                            {cand.symbolIcon ? (
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: "-6px",
                                  right: "-6px",
                                  background: "#ffffff",
                                  border: "1.5px solid #94a3b8",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.85rem"
                                }}
                                title={`Electoral Symbol: ${cand.symbolName || "Official Symbol"}`}
                              >
                                {cand.symbolIcon}
                              </span>
                            ) : null}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                                {cand.name}
                              </h4>
                              <span style={{
                                background: "#ecfdf5",
                                border: "1px solid #bbf7d0",
                                color: "#15803d",
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                padding: "2px 6px",
                                borderRadius: "6px"
                              }}>
                                NOMINEE
                              </span>
                            </div>

                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "3px" }}>
                              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{cand.rollNo}</span>
                              <span style={{ margin: "0 4px" }}>•</span>
                              <span>{cand.department || "B.Sc Nursing"}</span>
                            </div>

                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              {cand.year || "3rd Year (5th Sem)"}
                            </div>
                          </div>
                        </div>

                        {/* Manifesto Quote Box */}
                        <div style={{
                          background: "#f8fafc",
                          borderLeft: "3px solid #2563eb",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          fontSize: "0.82rem",
                          color: "var(--text-secondary)",
                          fontStyle: "italic",
                          lineHeight: 1.45,
                          marginBottom: "12px"
                        }}>
                          "{cand.manifesto || "Committed to upholding student nurses' academic and clinical welfare with dedicated leadership."}"
                        </div>
                      </div>

                      {/* Card Footer Tag */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "8px",
                        borderTop: "1px solid #f1f5f9",
                        fontSize: "0.75rem"
                      }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Contesting For:</span>
                        <span style={{ fontWeight: 800, color: "var(--primary-navy)" }}>{pos.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
