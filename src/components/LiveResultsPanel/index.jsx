import React, { useState, useEffect, useMemo } from "react";
import { 
  Award, 
  Users, 
  Vote, 
  Radio, 
  Clock, 
  Lock, 
  ShieldCheck, 
  Building, 
  CheckCircle2, 
  BarChart3, 
  ChevronRight, 
  Crown,
  Menu,
  X,
  Sparkles,
  Home
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { DEFAULT_AVATAR } from "../../utils/constants";
import { candidatePhotos } from "../../data/candidatePhotos";
import gehuLogo from "../../assets/gehu_logo.png";
import snaLogo from "../../assets/sna_logo.png";

export const LiveResultsPanel = ({ onOpenLogin, isStaffPreview = false, onReturnToStation }) => {
  const { electionConfig, positions, candidates, voters, ballots, booths, initialBooths, deletedBoothIds } = useElection();
  
  const allBooths = (booths && Array.isArray(booths) && booths.length > 0 ? booths : (initialBooths || []))
    .filter((b) => !deletedBoothIds?.includes(b.id));
  
  // Public Portal View Tabs: "CONTESTANTS" (Home) | "RESULTS" (Tallies)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const url = new URL(window.location.href);
      const tabParam = url.searchParams.get("tab");
      if (tabParam === "results") return "RESULTS";
    } catch(e) {}
    return "CONTESTANTS";
  });

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleTabSwitch = (newTab) => {
    setActiveTab(newTab);
    setIsMobileNavOpen(false);
    try {
      const url = new URL(window.location.href);
      if (newTab === "RESULTS") {
        url.searchParams.set("tab", "results");
      } else {
        url.searchParams.delete("tab");
      }
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    } catch(e) {}
  };

  const [selectedPostFilter, setSelectedPostFilter] = useState("ALL");
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
  const stage = electionConfig.electionStage || (electionConfig.status === "CONCLUDED" ? "CONCLUDED" : "LIVE_POLL");
  const publishedResults = electionConfig?.publishedResults;

  const filteredPositions = selectedPostFilter === "ALL"
    ? positions
    : positions.filter((p) => p.id === selectedPostFilter);

  return (
    <div className="public-portal-layout fade-in">
      {/* Staff Preview Return Banner */}
      {isStaffPreview && (
        <div style={{
          background: "#1e293b",
          color: "#ffffff",
          padding: "10px 18px",
          borderRadius: "10px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.85rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <span>👁️ Staff Preview: You are viewing the public portal as students and visitors see it.</span>
          {onReturnToStation && (
            <button
              onClick={onReturnToStation}
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Return to Station Console →
            </button>
          )}
        </div>
      )}

      {/* 1. PUBLIC INSTITUTIONAL HERO HEADER (DUAL LOGOS: GEHU & SNA) */}
      <header className="public-masthead">
        <div className="public-masthead-brand">
          <img
            src={gehuLogo}
            alt="Graphic Era Hill University"
            className="public-logo-img"
          />

          <div className="public-masthead-titles">
            <div className="public-institution-tag">
              {electionConfig.institution || "Graphic Era Hill University"} • {electionConfig.department || "College of Nursing"}
            </div>
            <h1 className="public-main-heading">
              {electionConfig.title || "SNA Student Nursing Council Elections 2026"}
            </h1>
            <p className="public-sub-heading">
              Student Nurses' Association of India (SNA) • Official Campus Electoral Portal
            </p>
          </div>
        </div>

        <div className="public-masthead-right">
          <img
            src={snaLogo}
            alt="Student Nurses Association of India"
            className="public-logo-img"
          />

          {/* Mobile Navigation Toggle Button */}
          <button
            id="btn-mobile-nav-toggle"
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="public-mobile-menu-btn"
            aria-label="Toggle navigation menu"
            title="Open Navigation Menu"
          >
            {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            <span>Menu</span>
          </button>

          {onOpenLogin && (
            <button
              id="btn-open-staff-login"
              type="button"
              onClick={onOpenLogin}
              className="public-login-btn"
              title="Official Electoral System Login"
            >
              <Lock size={15} />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* MOBILE INTERACTIVE NAVIGATION DRAWER */}
      {isMobileNavOpen && (
        <div className="public-mobile-nav-drawer fade-in">
          <div className="public-mobile-nav-header">
            <div className="nav-drawer-title">
              <Sparkles size={16} color="#d97706" />
              <span>Portal Navigation</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsMobileNavOpen(false)} 
              className="nav-drawer-close"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="public-mobile-nav-list">
            <button
              type="button"
              className={`public-mobile-nav-item ${activeTab === "CONTESTANTS" ? "active" : ""}`}
              onClick={() => handleTabSwitch("CONTESTANTS")}
            >
              <div className="nav-item-icon-box">
                <Users size={20} />
              </div>
              <div className="nav-item-body">
                <div className="nav-item-title-row">
                  <span className="nav-item-title">Contestants & Live Status</span>
                  {activeTab === "CONTESTANTS" && <span className="nav-item-pill">Active</span>}
                </div>
                <div className="nav-item-desc">Candidate profiles, photos, positions & manifestos</div>
              </div>
              <ChevronRight size={16} className="nav-item-arrow" />
            </button>

            <button
              type="button"
              className={`public-mobile-nav-item ${activeTab === "RESULTS" ? "active" : ""}`}
              onClick={() => handleTabSwitch("RESULTS")}
            >
              <div className="nav-item-icon-box">
                <BarChart3 size={20} />
              </div>
              <div className="nav-item-body">
                <div className="nav-item-title-row">
                  <span className="nav-item-title">Official Results & Tallies</span>
                  {publishedResults && <span className="nav-item-pill pill-live">Live Tallies</span>}
                </div>
                <div className="nav-item-desc">Official vote tallies, progress updates & winners</div>
              </div>
              <ChevronRight size={16} className="nav-item-arrow" />
            </button>

            {onOpenLogin && (
              <button
                type="button"
                className="public-mobile-nav-item nav-login-special"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onOpenLogin();
                }}
              >
                <div className="nav-item-icon-box login-icon-box">
                  <Lock size={20} />
                </div>
                <div className="nav-item-body">
                  <div className="nav-item-title-row">
                    <span className="nav-item-title">Officer & Staff Login</span>
                    <span className="nav-item-pill pill-gold">Desk Login</span>
                  </div>
                  <div className="nav-item-desc">Verification Desk, EVM Booth Terminal & Admin Console</div>
                </div>
                <ChevronRight size={16} className="nav-item-arrow" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. PUBLIC PORTAL NAVIGATION TABS: CONTESTANTS vs RESULTS */}
      <div className="public-nav-segmented">
        <button
          id="tab-btn-contestants"
          type="button"
          onClick={() => handleTabSwitch("CONTESTANTS")}
          className={`public-tab-btn ${activeTab === "CONTESTANTS" ? "active" : ""}`}
        >
          <Users size={17} />
          <span>1. Nominated Contestants & Live Status</span>
        </button>

        <button
          id="tab-btn-results"
          type="button"
          onClick={() => handleTabSwitch("RESULTS")}
          className={`public-tab-btn ${activeTab === "RESULTS" ? "active" : ""}`}
        >
          <BarChart3 size={17} />
          <span>2. Official Results & Tallies</span>
          {publishedResults && (
            <span style={{
              background: activeTab === "RESULTS" ? "#fbbf24" : "#059669",
              color: activeTab === "RESULTS" ? "#002147" : "#ffffff",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 800
            }}>
              Updated {publishedResults.publishedAt}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CONTESTANTS & LIVE STATUS (HOME TAB)              */}
      {/* ======================================================== */}
      {activeTab === "CONTESTANTS" && (
        <div className="fade-in">
          {/* STAGE A: PRE-POLL COUNTDOWN (GEHU OFFICIAL NAVY BLUE & WARM GOLD) */}
          {stage === "PRE_POLL" && (
            <div className="public-announcement-card fade-in">
              <div className="public-announcement-body">
                <div className="public-announcement-badge">
                  <Clock size={13} />
                  <span>Official Voting Commences Today at 3:00 PM (15:00 IST)</span>
                </div>
                <h2 className="public-announcement-title">
                  Campus Polling Stations Open Soon
                </h2>
                <p className="public-announcement-desc">
                  Electronic voting terminals across College of Nursing booths will open at 3:00 PM today.
                  Students are requested to review nominated candidates and their official manifestos below before voting.
                </p>
              </div>

              {/* Responsive Countdown Clock Display */}
              <div className="countdown-cluster">
                <div className="countdown-box">
                  <div className="countdown-digits">
                    {String(countdownHours).padStart(2, "0")}
                  </div>
                  <div className="countdown-tag">Hours</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-box">
                  <div className="countdown-digits">
                    {String(countdownMinutes).padStart(2, "0")}
                  </div>
                  <div className="countdown-tag">Minutes</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-box">
                  <div className="countdown-digits">
                    {String(countdownSeconds).padStart(2, "0")}
                  </div>
                  <div className="countdown-tag">Seconds</div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE B: VOTING IS LIVE (COUNTDOWN TIMER HIDDEN AS REQUESTED) */}
          {stage === "LIVE_POLL" && (
            <div className="card-base fade-in" style={{
              padding: "20px 28px",
              borderRadius: "16px",
              background: "#064e3b",
              border: "1px solid #047857",
              color: "#ffffff",
              boxShadow: "0 6px 20px rgba(6, 78, 59, 0.2)",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="live-dot" style={{ background: "#4ade80", boxShadow: "0 0 10px #4ade80", width: "10px", height: "10px", borderRadius: "50%" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, letterSpacing: "0.06em", color: "#a7f3d0", textTransform: "uppercase" }}>
                    Official Voting Is Live & In Progress
                  </span>
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  SNA Student Nursing Council Elections 2026 • Electronic Ballots Open
                </div>
                <div style={{ fontSize: "0.85rem", color: "#d1fae5", marginTop: "2px" }}>
                  Polling is underway across active EVM terminal booths. Voters must verify at the Verification Desk.
                </div>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.12)",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 800, color: "#d1fae5" }}>EVM Terminals</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#ffffff" }}>{allBooths.length} Booths Active</div>
              </div>
            </div>
          )}

          {/* STAGE C: ELECTION CONCLUDED / FINAL RESULTS & WINNERS DECLARED */}
          {stage === "CONCLUDED" && (
            <div className="card-base fade-in" style={{
              padding: "22px 28px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)",
              color: "#ffffff",
              boxShadow: "0 10px 32px rgba(180, 83, 9, 0.35)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={24} color="#fef08a" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 900, letterSpacing: "0.06em", color: "#fef08a", textTransform: "uppercase" }}>
                    🏆 OFFICIAL ELECTION RESULTS CERTIFIED & DECLARED
                  </span>
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "#ffffff", marginTop: "4px" }}>
                  Certified Winners • SNA Student Nursing Council 2026-2027
                </div>
                <div style={{ fontSize: "0.88rem", color: "#fef3c7", marginTop: "2px" }}>
                  All ballots sealed and certified by the Chief Electoral Officer. See official winners below.
                </div>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.3)",
                padding: "10px 22px",
                borderRadius: "12px",
                border: "1.5px solid rgba(255,255,255,0.3)",
                textAlign: "center"
              }}>
                <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#fef08a", display: "block" }}>CERTIFIED</span>
                <div style={{ fontSize: "0.72rem", color: "#fed7aa", fontWeight: 800, textTransform: "uppercase" }}>Official Declaration</div>
              </div>
            </div>
          )}

          {/* PERIODIC MID-POLL BULLETIN BANNER (ADMIN BROADCAST) */}
          {electionConfig.activeBulletin && (
            <div className="card-base fade-in" style={{
              padding: "16px 22px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
              border: "2px solid #3b82f6",
              boxShadow: "0 4px 18px rgba(59, 130, 246, 0.12)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Radio size={20} />
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
          {/* SECTION: HALL OF WINNERS (WHEN CONCLUDED)                */}
          {/* ======================================================== */}
          {stage === "CONCLUDED" && (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
              <div style={{ textAlign: "center", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--primary-navy)", margin: 0 }}>
                  Official Certified Council Winners 2026-2027
                </h2>
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Student Nurses' Association (SNA) Executive Council • Graphic Era Hill University
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
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
                      <div style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                        color: "#ffffff",
                        fontSize: "0.72rem",
                        fontWeight: 900,
                        padding: "3px 10px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 2px 6px rgba(217, 119, 6, 0.4)"
                      }}>
                        <Crown size={12} />
                        <span>WINNER</span>
                      </div>

                      <div style={{ marginBottom: "14px" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          COUNCIL OFFICE #{pos.sequence}
                        </span>
                        <h3 style={{ margin: "2px 0 0", fontSize: "1.3rem", fontWeight: 900, color: "var(--primary-navy)" }}>
                          {pos.title}
                        </h3>
                      </div>

                      {winner ? (
                        <div>
                          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                            <div style={{ position: "relative" }}>
                              <img
                                src={winnerImg}
                                alt={winner.name}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  borderRadius: "14px",
                                  objectFit: "cover",
                                  border: "3px solid #f59e0b",
                                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
                                }}
                                onError={(e) => {
                                  if (candidatePhotos[winner.id]) e.target.src = candidatePhotos[winner.id];
                                  else e.target.src = DEFAULT_AVATAR;
                                }}
                              />
                              <div style={{
                                position: "absolute",
                                bottom: "-8px",
                                right: "-6px",
                                background: "#f59e0b",
                                color: "#ffffff",
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.8rem",
                                fontWeight: 900,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                              }}>
                                👑
                              </div>
                            </div>

                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "var(--primary-navy)" }}>
                                {winner.name}
                              </h4>
                              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                Roll No: <span className="font-mono font-bold">{winner.rollNo}</span> • {winner.year}
                              </div>
                              <div style={{ marginTop: "6px" }}>
                                <span style={{
                                  background: "#ecfdf5",
                                  border: "1px solid #a7f3d0",
                                  color: "#065f46",
                                  fontSize: "0.78rem",
                                  fontWeight: 800,
                                  padding: "2px 8px",
                                  borderRadius: "12px"
                                }}>
                                  Elected with {winner.votes || 0} Votes {margin > 0 && runnerUp ? `(+${margin} lead)` : ""}
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
          {/* SECTION: NOMINATED CANDIDATES SHOWCASE & MANIFESTOS     */}
          {/* ======================================================== */}
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Filter Pills */}
            <div className="public-filter-row">
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#002147" }}>
                  {stage === "CONCLUDED" ? "All Nominated Candidates Reference" : "Nominated Candidates & Manifestos"}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  Official roster of student contestants ordered by ballot sequence
                </p>
              </div>

              <div className="public-filter-pills">
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>Filter:</span>
                <button
                  onClick={() => setSelectedPostFilter("ALL")}
                  className={`public-filter-btn ${selectedPostFilter === "ALL" ? "active" : ""}`}
                >
                  All Posts
                </button>
                {positions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPostFilter(p.id)}
                    className={`public-filter-btn ${selectedPostFilter === p.id ? "active" : ""}`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Positions & Candidate Cards */}
            {filteredPositions.map((pos) => {
              const posCandidates = candidates
                .filter((c) => c.positionId === pos.id)
                .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

              return (
                <div key={pos.id} className="card-base" style={{ padding: "20px 22px", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
                  {/* Position Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "18px" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#002147", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        COUNCIL OFFICE #{pos.sequence}
                      </span>
                      <h3 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 900, color: "var(--primary-navy)" }}>
                        {pos.title}
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {pos.description}
                      </p>
                    </div>
                    <span style={{
                      background: "#f1f5f9",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)"
                    }}>
                      {posCandidates.length} Nominees Contesting
                    </span>
                  </div>

                  {/* Candidates Grid - Expansive, Responsive Layout */}
                  <div className="public-candidates-grid">
                    {posCandidates.map((cand, idx) => {
                      const imgSrc = (cand.avatarUrl && cand.avatarUrl !== DEFAULT_AVATAR && !cand.avatarUrl.startsWith("data:image/svg+xml"))
                        ? cand.avatarUrl
                        : candidatePhotos[cand.id] || DEFAULT_AVATAR;

                      const ballotNo = idx + 1;

                      return (
                        <div
                          key={cand.id}
                          className="card-base"
                          style={{
                            padding: "18px",
                            borderRadius: "14px",
                            border: "1.5px solid var(--border-light)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            background: "#ffffff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div>
                            {/* Candidate Top Row */}
                            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "14px" }}>
                              <div style={{ position: "relative" }}>
                                <img
                                  src={imgSrc}
                                  alt={cand.name}
                                  style={{
                                    width: "76px",
                                    height: "76px",
                                    borderRadius: "14px",
                                    objectFit: "cover",
                                    border: "2px solid var(--border-light)",
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                                    flexShrink: 0
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
                                      width: "26px",
                                      height: "26px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.9rem"
                                    }}
                                    title={`Electoral Symbol: ${cand.symbolName || "Official Symbol"}`}
                                  >
                                    {cand.symbolIcon}
                                  </span>
                                ) : null}
                              </div>

                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                                  <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                                    {cand.name}
                                  </h4>
                                  <span style={{
                                    background: "#eff6ff",
                                    border: "1px solid #bfdbfe",
                                    color: "#1d4ed8",
                                    fontSize: "0.72rem",
                                    fontWeight: 900,
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    whiteSpace: "nowrap"
                                  }}>
                                    Ballot #{ballotNo}
                                  </span>
                                </div>

                                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                  Roll No: <span className="font-mono font-bold">{cand.rollNo}</span>
                                </div>
                                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                  {cand.department} • {cand.year}
                                </div>
                              </div>
                            </div>

                            {/* Manifesto Box */}
                            {cand.manifesto && (
                              <div style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                padding: "10px 12px",
                                marginBottom: "12px"
                              }}>
                                <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                                  Student Manifesto:
                                </div>
                                <p style={{ margin: 0, fontSize: "0.84rem", color: "#334155", fontStyle: "italic", lineHeight: 1.4 }}>
                                  "{cand.manifesto}"
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Candidate Footer */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "10px",
                            borderTop: "1px solid var(--border-light)",
                            fontSize: "0.82rem"
                          }}>
                            <span style={{ color: "var(--text-muted)" }}>
                              Symbol: <strong>{cand.symbolName || "Official Symbol"}</strong>
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#059669", fontWeight: 800 }}>
                              <CheckCircle2 size={13} />
                              <span>Eligible Nominee</span>
                            </span>
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
      )}

      {/* ======================================================== */}
      {/* TAB 2: OFFICIAL RESULTS & TALLIES (DEDICATED VIEW)       */}
      {/* ======================================================== */}
      {activeTab === "RESULTS" && (
        <div className="fade-in">
          {/* Checkpoint Status Banner */}
          {publishedResults ? (
            <div className="card-base" style={{
              padding: "20px 28px",
              borderRadius: "16px",
              background: publishedResults.isFinal || stage === "CONCLUDED"
                ? "linear-gradient(135deg, #78350f 0%, #b45309 100%)"
                : "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(30, 58, 138, 0.25)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{
                    background: publishedResults.isFinal || stage === "CONCLUDED" ? "#f59e0b" : "#10b981",
                    color: "#ffffff",
                    padding: "2px 10px",
                    borderRadius: "14px",
                    fontSize: "0.76rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    {publishedResults.isFinal || stage === "CONCLUDED" ? "🏆 FINAL CERTIFIED TALLY" : "● INTERIM OFFICIAL UPDATE"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#e0e7ff" }}>
                    Last Verified at <strong>{publishedResults.publishedAt}</strong>
                  </span>
                </div>
                <h2 style={{ margin: "2px 0 0", fontSize: "1.4rem", fontWeight: 900, color: "#ffffff" }}>
                  Official Election Commission Published Standings
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: "0.85rem", color: "#e2e8f0" }}>
                  Graphic Era Hill University • College of Nursing SNA Elections 2026
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                {!(publishedResults.isFinal || stage === "CONCLUDED") && (
                  <div style={{
                    background: "rgba(255,255,255,0.15)",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 800, color: "#dbeafe" }}>
                      Next Update Scheduled
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#ffffff" }}>
                      In ~{publishedResults.nextUpdateNotice || "15 minutes"}
                    </div>
                  </div>
                )}

                <div style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 800, color: "#dbeafe" }}>
                    Turnout Recorded
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#ffffff" }}>
                    {publishedResults.turnoutPercent}% ({publishedResults.totalVotesRecorded} Ballots)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-base" style={{
              padding: "48px 24px",
              textAlign: "center",
              borderRadius: "16px",
              background: "#ffffff",
              border: "1.5px solid var(--border-light)",
              marginBottom: "20px"
            }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Clock size={32} />
              </div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--primary-navy)" }}>
                Official Results Checkpoint In Preparation
              </h3>
              <p style={{ color: "var(--text-secondary)", maxWidth: "560px", margin: "8px auto 0", fontSize: "0.95rem", lineHeight: 1.5 }}>
                The Chief Electoral Officer and SNA Election Commissioners will release verified progress tallies periodically (every 15–20 minutes) throughout polling. Please check back shortly for the first official release.
              </p>
            </div>
          )}

          {/* Results Grid by Position */}
          {publishedResults && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "20px" }}>
              {positions.map((pos) => {
                const talliesList = (publishedResults.tallies || candidates)
                  .filter((c) => c.positionId === pos.id)
                  .sort((a, b) => (b.votes || 0) - (a.votes || 0));

                const totalPostVotes = talliesList.reduce((sum, c) => sum + (c.votes || 0), 0);
                const leader = talliesList[0];
                const runnerUp = talliesList[1];
                const margin = leader && runnerUp ? (leader.votes || 0) - (runnerUp.votes || 0) : (leader?.votes || 0);
                const isConcluded = stage === "CONCLUDED" || publishedResults.isFinal;

                return (
                  <div key={pos.id} className="card-base" style={{
                    padding: "22px",
                    borderRadius: "16px",
                    border: isConcluded ? "2px solid #f59e0b" : "1.5px solid var(--border-light)",
                    background: "#ffffff"
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "16px" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#2563eb", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          COUNCIL OFFICE #{pos.sequence}
                        </span>
                        <h3 style={{ margin: "2px 0 0", fontSize: "1.25rem", fontWeight: 900, color: "var(--primary-navy)" }}>
                          {pos.title}
                        </h3>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--primary-navy)" }}>
                          {totalPostVotes} Votes
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                          Total Post Tallies
                        </div>
                      </div>
                    </div>

                    {/* Leader Status Callout */}
                    {leader && totalPostVotes > 0 && (
                      <div style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        marginBottom: "16px",
                        background: isConcluded ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" : "#ecfdf5",
                        border: isConcluded ? "1px solid #fde68a" : "1px solid #bbf7d0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>{isConcluded ? "👑" : "🟢"}</span>
                          <span style={{ fontWeight: 800, fontSize: "0.85rem", color: isConcluded ? "#92400e" : "#065f46" }}>
                            {isConcluded ? `ELECTED: ${leader.name}` : `Currently Leading: ${leader.name}`}
                          </span>
                        </div>
                        {runnerUp && margin > 0 && (
                          <span style={{
                            background: isConcluded ? "#f59e0b" : "#10b981",
                            color: "#ffffff",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.72rem",
                            fontWeight: 900
                          }}>
                            +{margin} vote lead
                          </span>
                        )}
                      </div>
                    )}

                    {/* Candidate Vote Bars */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {talliesList.map((cand, idx) => {
                        const votes = cand.votes || 0;
                        const pct = totalPostVotes > 0 ? ((votes / totalPostVotes) * 100).toFixed(1) : "0.0";
                        const isLeading = idx === 0 && votes > 0;
                        const imgSrc = (cand.avatarUrl && cand.avatarUrl !== DEFAULT_AVATAR && !cand.avatarUrl.startsWith("data:image/svg+xml"))
                          ? cand.avatarUrl
                          : candidatePhotos[cand.id] || DEFAULT_AVATAR;

                        return (
                          <div key={cand.id} style={{
                            padding: "10px 12px",
                            borderRadius: "10px",
                            background: isLeading ? (isConcluded ? "#fffbeb" : "#f0fdf4") : "#f8fafc",
                            border: isLeading ? (isConcluded ? "1px solid #fde68a" : "1px solid #bbf7d0") : "1px solid #e2e8f0"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <img
                                  src={imgSrc}
                                  alt={cand.name}
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: isLeading ? "2px solid #059669" : "1px solid #cbd5e1",
                                    flexShrink: 0
                                  }}
                                  onError={(e) => {
                                    if (candidatePhotos[cand.id]) e.target.src = candidatePhotos[cand.id];
                                    else e.target.src = DEFAULT_AVATAR;
                                  }}
                                />
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--primary-navy)" }}>
                                    {idx + 1}. {cand.name}
                                  </div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    Roll No: <span className="font-mono">{cand.rollNo}</span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 900, fontSize: "1rem", color: isLeading ? "#059669" : "var(--primary-navy)" }}>
                                  {votes} Votes
                                </div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                                  {pct}% share
                                </div>
                              </div>
                            </div>

                            {/* Animated Progress Bar */}
                            <div style={{
                              width: "100%",
                              height: "8px",
                              borderRadius: "4px",
                              background: "#e2e8f0",
                              overflow: "hidden"
                            }}>
                              <div style={{
                                width: `${pct}%`,
                                height: "100%",
                                borderRadius: "4px",
                                background: isLeading 
                                  ? (isConcluded ? "linear-gradient(90deg, #d97706, #f59e0b)" : "linear-gradient(90deg, #059669, #10b981)") 
                                  : "linear-gradient(90deg, #3b82f6, #60a5fa)",
                                transition: "width 0.4s ease"
                              }} />
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
        </div>
      )}

      {/* 3. INSTITUTIONAL & ELECTORAL INTEGRITY FOOTER */}
      <footer className="public-portal-footer">
        <div className="public-footer-top">
          <div style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Building size={18} color="#002147" />
              <strong style={{ fontSize: "0.95rem", color: "#002147" }}>
                Graphic Era Hill University • College of Nursing
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Student Nurses' Association of India (SNA) Campus Chapter. Official Paperless Electoral System operated under the supervision of the Chief Electoral Officer and Faculty Advisory Board.
            </p>
          </div>

          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#002147", letterSpacing: "0.04em", marginBottom: "8px" }}>
                Electoral Governance
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "5px" }}>
                <li>• Code of Election Conduct 2026</li>
                <li>• Verification Desk ID Policy</li>
                <li>• Electronic Ballot Secrecy Act</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#002147", letterSpacing: "0.04em", marginBottom: "8px" }}>
                Voter Privacy Guarantee
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: "260px", lineHeight: 1.4 }}>
                All electronic votes are anonymous, cryptographically segregated, and untraceable to student identity roll numbers.
              </p>
            </div>
          </div>
        </div>

        <div className="public-footer-bottom">
          <span>© 2026 Graphic Era Hill University • Student Nurses' Association (SNA). All rights reserved.</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ color: "var(--text-muted)" }}>Campus EVM v4.2 Pro</span>
            <span>•</span>
            <span style={{ color: "#059669", fontWeight: 700 }}>● Network Status: Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
