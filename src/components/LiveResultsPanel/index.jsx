import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  Users, 
  Vote, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Sparkles,
  Layers,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  Building,
  Quote,
  Flame,
  ArrowRight
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { DEFAULT_AVATAR } from "../../utils/constants";
import { candidatePhotos } from "../../data/candidatePhotos";
import { OfficialElectionReportModal } from "../AdminPanel/OfficialElectionReportModal";

export const LiveResultsPanel = () => {
  const { electionConfig, positions, candidates, voters, ballots, booths, initialBooths } = useElection();
  
  const allBooths = booths && Array.isArray(booths) && booths.length > 0 ? booths : (initialBooths || []);
  
  const [selectedPostFilter, setSelectedPostFilter] = useState("ALL");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOfficialReport, setShowOfficialReport] = useState(false);
  const [now, setNow] = useState(new Date());

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;

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
  const isPrePoll = diffMs > 0 && votedCount === 0;

  const countdownHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const countdownMinutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
  const countdownSeconds = Math.max(0, Math.floor((diffMs % (1000 * 60)) / 1000));

  // Display Tabs: "CANDIDATES" | "RESULTS" | "BOOTHS"
  const [activeTab, setActiveTab] = useState(() => (votedCount > 0 ? "RESULTS" : "CANDIDATES"));

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
    <div className={`live-results-container fade-in ${isFullscreen ? "fullscreen-mode" : ""}`} style={{ maxWidth: "1400px", margin: "0 auto", padding: "12px 20px" }}>
      {/* 1. PUBLIC AUDITORIUM HERO HEADER */}
      <div className="card-base" style={{
        padding: "20px 28px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1.5px solid var(--border-light)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          {/* Institution & Election Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
              color: "#ffffff"
            }}>
              <Building size={30} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1d4ed8",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}>
                  {electionConfig.institution || "Graphic Era Hill University"} • {electionConfig.department || "College of Nursing"}
                </span>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: isPrePoll ? "#fef3c7" : "#dcfce7",
                  border: isPrePoll ? "1px solid #fde68a" : "1px solid #bbf7d0",
                  color: isPrePoll ? "#b45309" : "#15803d",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: 800
                }}>
                  <Radio size={12} className={isPrePoll ? "" : "radio-pulse"} />
                  {isPrePoll ? "PRE-POLL SCHEDULE" : "LIVE VOTING TELEMETRY"}
                </span>
              </div>

              <h1 style={{
                margin: 0,
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--primary-navy)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2
              }}>
                {electionConfig.title || "SNA Student Nursing Council Elections 2026"}
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                Student Nurses' Association (SNA) Official Democratic Council Elections • 3 EVM Booths Active
              </p>
            </div>
          </div>

          {/* Turnout Statistics & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <div className="card-base" style={{ padding: "8px 16px", textAlign: "center", borderRadius: "10px", background: "var(--bg-subtle)" }}>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--primary-navy)", lineHeight: 1 }}>{votedCount}</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "2px" }}>Ballots Cast</div>
              </div>
              <div className="card-base" style={{ padding: "8px 16px", textAlign: "center", borderRadius: "10px", background: "var(--bg-subtle)" }}>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--primary-navy)", lineHeight: 1 }}>{totalVoters}</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "2px" }}>Total Roster</div>
              </div>
              <div className="card-base" style={{ padding: "8px 16px", textAlign: "center", borderRadius: "10px", background: "#ecfdf5", border: "1.5px solid #a7f3d0" }}>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#059669", lineHeight: 1 }}>{turnoutPercent}%</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#047857", textTransform: "uppercase", marginTop: "2px" }}>Turnout Rate</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowOfficialReport(true)}
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "0.85rem", fontWeight: 700, borderRadius: "8px" }}
                title="Generate Official Election & Ballot Audit Report (PDF)"
              >
                <FileText size={16} />
                <span>PDF Report</span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="btn-secondary"
                style={{ padding: "8px 12px", borderRadius: "8px" }}
                title={isFullscreen ? "Exit Fullscreen" : "Projector Fullscreen View"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC SCHEDULE & COUNTDOWN / VOTING LIVE BANNER */}
      {isPrePoll ? (
        /* Pre-poll Countdown to 3:00 PM */
        <div className="card-base fade-in" style={{
          padding: "18px 24px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          color: "#ffffff",
          boxShadow: "0 8px 24px rgba(49, 46, 129, 0.25)",
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
              Graphic Era Hill University • College of Nursing SNA Council Elections
            </div>
            <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: "2px" }}>
              Explore the nominated student candidates and manifestos below. 3 EVM Booths will unlock promptly at 3:00 PM.
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
      ) : (
        /* Active Voting Banner */
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
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>
              Simultaneous Multi-EVM Polling Underway • Cast Your Ballot at EVM Booths #1, #2, #3
            </div>
            <div style={{ fontSize: "0.82rem", color: "#a7f3d0", marginTop: "2px" }}>
              Official Student ID verification required at Polling Desk before voting. Real-time encryption active.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ffffff" }}>{votedCount} / {totalVoters} Voted</div>
              <div style={{ fontSize: "0.75rem", color: "#a7f3d0", fontWeight: 600 }}>{turnoutPercent}% Completed</div>
            </div>
            <div style={{ width: "120px", height: "10px", background: "rgba(255,255,255,0.25)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ width: `${turnoutPercent}%`, height: "100%", background: "#4ade80", transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>
      )}

      {/* 3. PUBLIC NAVIGATION TABS */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "16px",
        borderBottom: "2px solid var(--border-light)",
        paddingBottom: "10px",
        flexWrap: "wrap"
      }}>
        {/* Main Public Tabs */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("CANDIDATES")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: 800,
              cursor: "pointer",
              background: activeTab === "CANDIDATES" ? "var(--primary-navy)" : "#f1f5f9",
              color: activeTab === "CANDIDATES" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.2s ease"
            }}
          >
            <Users size={16} />
            <span>Nominated Contestants Showcase</span>
            <span style={{
              background: activeTab === "CANDIDATES" ? "rgba(255,255,255,0.2)" : "#cbd5e1",
              padding: "2px 6px",
              borderRadius: "12px",
              fontSize: "0.72rem"
            }}>
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("RESULTS")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: 800,
              cursor: "pointer",
              background: activeTab === "RESULTS" ? "var(--primary-navy)" : "#f1f5f9",
              color: activeTab === "RESULTS" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.2s ease"
            }}
          >
            <BarChart3 size={16} />
            <span>Live Results & Standings</span>
            <span style={{
              background: activeTab === "RESULTS" ? "#10b981" : "#cbd5e1",
              color: activeTab === "RESULTS" ? "#ffffff" : "inherit",
              padding: "2px 6px",
              borderRadius: "12px",
              fontSize: "0.72rem"
            }}>
              {votedCount} votes
            </span>
          </button>

          <button
            onClick={() => setActiveTab("BOOTHS")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: 800,
              cursor: "pointer",
              background: activeTab === "BOOTHS" ? "var(--primary-navy)" : "#f1f5f9",
              color: activeTab === "BOOTHS" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.2s ease"
            }}
          >
            <Vote size={16} />
            <span>EVM Terminals Live Activity</span>
            <span style={{
              background: activeTab === "BOOTHS" ? "rgba(255,255,255,0.2)" : "#cbd5e1",
              padding: "2px 6px",
              borderRadius: "12px",
              fontSize: "0.72rem"
            }}>
              {allBooths.length} Booths
            </span>
          </button>
        </div>

        {/* Position Filter Pills (Active for Candidates and Results) */}
        {activeTab !== "BOOTHS" && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Post:</span>
            <button
              onClick={() => setSelectedPostFilter("ALL")}
              style={{
                border: "none",
                borderRadius: "20px",
                padding: "4px 10px",
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
                  padding: "4px 10px",
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
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: NOMINATED CONTESTANTS SHOWCASE */}
      {/* ======================================================== */}
      {activeTab === "CANDIDATES" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                Official Electoral Candidates & Ballot Manifestos
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Verified contestants nominated for the SNA Student Nursing Council 2026. Review candidate profiles and manifestos before voting.
              </p>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Showing {filteredPositions.length} Electoral Offices • {candidates.filter(c => selectedPostFilter === "ALL" || c.positionId === selectedPostFilter).length} Nominees
            </div>
          </div>

          {filteredPositions.map((pos) => {
            const posCandidates = candidates.filter((c) => c.positionId === pos.id);
            return (
              <div key={pos.id} className="card-base" style={{ padding: "20px", borderRadius: "14px", border: "1.5px solid var(--border-light)" }}>
                {/* Position Title Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2563eb", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      ELECTORAL STEP #{pos.sequence}
                    </span>
                    <h3 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 800, color: "var(--primary-navy)" }}>
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

                {/* Candidates Cards Grid */}
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
                          {/* Candidate Header */}
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
                                  if (candidatePhotos[cand.id]) {
                                    e.target.src = candidatePhotos[cand.id];
                                  } else {
                                    e.target.src = DEFAULT_AVATAR;
                                  }
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
                                  OFFICIAL NOMINEE
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

                          {/* Manifesto Quote */}
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
                            "{cand.manifesto || "Committed to upholding the highest standards of student nurses' welfare, academic excellence, and clinical clinical coordination."}"
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
      )}

      {/* ======================================================== */}
      {/* TAB 2: LIVE RESULTS & STANDINGS */}
      {/* ======================================================== */}
      {activeTab === "RESULTS" && (
        <div className="fade-in">
          <div className="live-positions-grid">
            {filteredPositions.map((pos) => {
              const posCandidates = candidates
                .filter((c) => c.positionId === pos.id)
                .sort((a, b) => (b.votes || 0) - (a.votes || 0));

              const totalPosVotes = posCandidates.reduce((sum, c) => sum + (c.votes || 0), 0);
              const leader = posCandidates[0];
              const runnerUp = posCandidates[1];
              const leadMargin = leader && runnerUp ? (leader.votes || 0) - (runnerUp.votes || 0) : leader?.votes || 0;

              return (
                <div key={pos.id} className="live-position-block card-base">
                  {/* Position Header */}
                  <div className="live-pos-head">
                    <div className="pos-head-title-wrap">
                      <span className="step-tag">BALLOT STEP #{pos.sequence}</span>
                      <h2 className="pos-display-title">{pos.title}</h2>
                      <span className="pos-mandate-text">{pos.description}</span>
                    </div>

                    <div className="pos-head-metric">
                      <span className="total-votes-polled">{totalPosVotes}</span>
                      <span className="total-votes-label">Votes Cast</span>
                    </div>
                  </div>

                  {/* Leader Callout Banner if leader exists */}
                  {leader && leader.votes > 0 && (
                    <div className="leader-spotlight-bar">
                      <Award size={18} color="#059669" />
                      <span>
                        Currently Leading: <strong>{leader.name}</strong>{leader.symbolName ? ` (${leader.symbolName})` : ""}
                      </span>
                      {leadMargin > 0 && runnerUp ? (
                        <span className="lead-margin-tag">+{leadMargin} vote lead</span>
                      ) : runnerUp && leadMargin === 0 ? (
                        <span className="lead-margin-tag tag-tied">Tied for Lead</span>
                      ) : null}
                    </div>
                  )}

                  {/* Candidate Progress Bars */}
                  <div className="live-candidates-list">
                    {posCandidates.map((cand, idx) => {
                      const voteCount = cand.votes || 0;
                      const votePercentage = totalPosVotes > 0 
                        ? ((voteCount / totalPosVotes) * 100).toFixed(1) 
                        : 0;
                      const isTopLeader = idx === 0 && voteCount > 0;

                      return (
                        <div 
                          key={cand.id} 
                          className={`live-candidate-row card-base ${isTopLeader ? "leader-row" : ""}`}
                        >
                          {/* Avatar & Symbol */}
                          <div className="live-avatar-cell">
                            <img
                              src={
                                cand.avatarUrl &&
                                cand.avatarUrl !== DEFAULT_AVATAR &&
                                !cand.avatarUrl.startsWith("data:image/svg+xml")
                                  ? cand.avatarUrl
                                  : candidatePhotos[cand.id] || DEFAULT_AVATAR
                              }
                              alt={cand.name}
                              className="live-avatar-img"
                              onError={(e) => {
                                if (candidatePhotos[cand.id]) {
                                  e.target.src = candidatePhotos[cand.id];
                                } else {
                                  e.target.src = DEFAULT_AVATAR;
                                }
                              }}
                            />
                            {cand.symbolIcon ? (
                              <span className="live-symbol-badge" title={`Symbol: ${cand.symbolName}`}>
                                {cand.symbolIcon}
                              </span>
                            ) : null}
                          </div>

                          {/* Name & Department */}
                          <div className="live-meta-cell">
                            <div className="live-cand-name-row">
                              <h4 className="live-cand-name">{cand.name}</h4>
                              {isTopLeader && (
                                <span className="badge badge-success">
                                  <TrendingUp size={12} /> Frontrunner
                                </span>
                              )}
                            </div>
                            <div className="live-cand-dept-row">
                              <span>{cand.rollNo}</span>
                              <span className="dot-sep">•</span>
                              <span>{cand.department}</span>
                            </div>

                            {/* Animated Progress Bar */}
                            <div className="live-vote-track">
                              <div
                                className={`live-vote-bar ${isTopLeader ? "bar-leader" : "bar-standard"}`}
                                style={{ width: `${votePercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Vote Count & Percentage */}
                          <div className="live-tally-cell">
                            <div className="live-vote-number">{voteCount}</div>
                            <div className="live-vote-pct">{votePercentage}%</div>
                          </div>
                        </div>
                      );
                    })}

                    {posCandidates.length === 0 && (
                      <div className="empty-pos-placeholder">
                        No candidates nominated yet for this office.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: EVM TERMINALS LIVE ACTIVITY (MULTI-BOOTH TELEMETRY) */}
      {/* ======================================================== */}
      {activeTab === "BOOTHS" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Architecture Banner */}
          <div className="card-base" style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: "#eff6ff",
            border: "1.5px solid #bfdbfe",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Vote size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                  High-Capacity Multi-Booth Parallel Voting System
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {allBooths.length} independent secure EVM terminals are operating simultaneously to ensure instant voting and zero waiting queue.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                background: "#dcfce7",
                border: "1px solid #86efac",
                color: "#15803d",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 800
              }}>
                3X Speed Multi-Processing
              </span>
            </div>
          </div>

          {/* EVM Booths Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
            {allBooths.map((b, idx) => {
              const isSubmitting = b.status === "SUBMITTING";
              const isUnlocked = b.status === "UNLOCKED";
              const boothBallots = ballots.filter((bl) => bl.boothId === b.id).length;

              return (
                <div
                  key={b.id}
                  className="card-base"
                  style={{
                    padding: "24px",
                    borderRadius: "16px",
                    border: isSubmitting
                      ? "2px solid #f59e0b"
                      : isUnlocked
                      ? "2px solid #10b981"
                      : "2px solid var(--border-light)",
                    background: isSubmitting
                      ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                      : isUnlocked
                      ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                      : "var(--bg-card)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    position: "relative"
                  }}
                >
                  {/* Top Bar */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: isUnlocked ? "#10b981" : isSubmitting ? "#f59e0b" : "#64748b",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {isUnlocked ? <Unlock size={20} /> : <Lock size={20} />}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                          TERMINAL STATION #{idx + 1}
                        </div>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                          {b.name || b.shortName}
                        </h3>
                      </div>
                    </div>

                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      background: isSubmitting ? "#fef3c7" : isUnlocked ? "#dcfce7" : "#f1f5f9",
                      color: isSubmitting ? "#b45309" : isUnlocked ? "#15803d" : "#475569",
                      border: isSubmitting ? "1px solid #fde68a" : isUnlocked ? "1px solid #86efac" : "1px solid #cbd5e1"
                    }}>
                      {isSubmitting ? "⏳ RECORDING BALLOT" : isUnlocked ? "🟢 VOTING IN PROGRESS" : "🔒 READY / LOCKED"}
                    </span>
                  </div>

                  {/* Active Voter Status */}
                  <div style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "10px",
                    padding: "14px",
                    marginBottom: "16px"
                  }}>
                    {isUnlocked && b.authorizedVoter ? (
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>
                          Voter Inside Booth:
                        </div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                          {b.authorizedVoter.name}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                          Roll ID: <strong style={{ fontFamily: "monospace" }}>{b.authorizedVoter.studentId}</strong> • {b.authorizedVoter.year}
                        </div>
                      </div>
                    ) : isSubmitting ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#b45309" }}>
                        <span className="live-dot" style={{ background: "#f59e0b" }} />
                        <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                          Voter finished voting. Terminal encrypting ballot and auto-resetting...
                        </span>
                      </div>
                    ) : (
                      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                        Terminal is in secure locked standby. Awaiting next verified voter dispatch from Verification Desk.
                      </div>
                    )}
                  </div>

                  {/* Terminal Stats Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <span>Ballots Processed: <strong style={{ color: "var(--primary-navy)" }}>{boothBallots}</strong></span>
                    <span>Status: <strong style={{ color: isUnlocked ? "#059669" : "#64748b" }}>{isUnlocked ? "Active" : "Standby"}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Report Modal */}
      <OfficialElectionReportModal
        isOpen={showOfficialReport}
        onClose={() => setShowOfficialReport(false)}
      />
    </div>
  );
};

