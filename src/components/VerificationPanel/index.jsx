import React, { useState, useEffect, useMemo } from "react";
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
  Clock,
  BookOpen,
  UserPlus,
  Users,
  X,
  FileText,
  Filter,
  Check
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { DEFAULT_AVATAR } from "../../utils/constants";
import { Modal } from "../common/Modal";

export const VerificationPanel = () => {
  const { 
    voters, 
    electionConfig, 
    verifyStudent, 
    authorizeVoterForBooth, 
    cancelBoothAuthorization,
    addVoter
  } = useElection();

  const [inputQuery, setInputQuery] = useState("");
  const [currentVerification, setCurrentVerification] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modal states
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [directoryYearFilter, setDirectoryYearFilter] = useState("ALL");
  const [directorySearchQuery, setDirectorySearchQuery] = useState("");
  const [directoryStatusFilter, setDirectoryStatusFilter] = useState("ALL"); // "ALL" | "ELIGIBLE" | "VOTED"

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    studentId: "",
    name: "",
    year: "1st Year",
    semester: "1st Semester",
    course: "B.Sc Nursing",
    fatherName: ""
  });
  const [regError, setRegError] = useState("");

  const boothState = electionConfig.boothState || {};
  const isBoothUnlocked = boothState.status === "UNLOCKED";
  const isBoothSubmitting = boothState.status === "SUBMITTING";

  // Real-time reactive update: Automatically updates verification card when voter votes or booth changes
  useEffect(() => {
    if (currentVerification && currentVerification.voter) {
      const updated = verifyStudent(currentVerification.voter.studentId);
      if (updated) {
        setCurrentVerification(updated);
      }
    }
  }, [voters, electionConfig.boothState]);

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
      // If eligible student is displayed, Enter authorizes them directly!
      if (currentVerification && currentVerification.status === "ELIGIBLE" && currentVerification.voter) {
        handleAuthorize();
      } else {
        handlePerformLookup();
      }
    }
  };

  const handleAuthorize = (specificVoter) => {
    const voter = specificVoter || currentVerification?.voter;
    if (!voter) return;

    if (isBoothUnlocked) {
      if (!window.confirm("The EVM booth is currently occupied with an authorized voter. Override and re-authorize?")) {
        return;
      }
    }

    const res = authorizeVoterForBooth(voter.studentId);
    if (res.success) {
      setFeedbackMessage({
        type: "success",
        text: `Voter ${voter.name} (${voter.studentId}) authorized! EVM Terminal is now UNLOCKED.`
      });
      const updated = verifyStudent(voter.studentId);
      setCurrentVerification(updated);
    } else {
      setFeedbackMessage({
        type: "error",
        text: res.message
      });
    }
  };

  const handleRelockBooth = () => {
    cancelBoothAuthorization();
    setFeedbackMessage({
      type: "info",
      text: "EVM Terminal Alpha-01 has been locked and reset to Standby."
    });
    if (currentVerification && currentVerification.voter) {
      const updated = verifyStudent(currentVerification.voter.studentId);
      setCurrentVerification(updated);
    }
  };

  const handleQuickSelect = (studentId) => {
    setInputQuery(studentId);
    handlePerformLookup(studentId);
  };

  // Year change in register modal automatically syncs semester
  const handleYearChangeInRegister = (newYear) => {
    let sem = "1st Semester";
    if (newYear === "2nd Year") sem = "3rd Semester";
    if (newYear === "3rd Year") sem = "5th Semester";
    if (newYear === "4th Year") sem = "7th Semester";
    setRegForm((prev) => ({ ...prev, year: newYear, semester: sem }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError("");

    if (!regForm.studentId.trim()) {
      setRegError("Please enter a valid Student Roll / ID number.");
      return;
    }
    if (!regForm.name.trim()) {
      setRegError("Please enter the student's full name.");
      return;
    }

    const result = addVoter({
      studentId: regForm.studentId.trim().toUpperCase(),
      name: regForm.name.trim(),
      year: regForm.year,
      semester: regForm.semester,
      course: regForm.course || "B.Sc Nursing",
      fatherName: regForm.fatherName.trim() || "N/A"
    });

    if (!result.success) {
      setRegError(result.message || "Failed to register student.");
      return;
    }

    setIsRegisterOpen(false);
    setInputQuery(result.voter.studentId);
    handleQuickSelect(result.voter.studentId);
    setFeedbackMessage({
      type: "success",
      text: `Student ${result.voter.name} (${result.voter.studentId}) registered and verified! Click Authorize to unlock EVM.`
    });
  };

  // Directory voters calculation
  const directoryYearStats = useMemo(() => {
    const counts = { "ALL": voters.length, "1st Year": 0, "2nd Year": 0, "3rd Year": 0, "4th Year": 0 };
    voters.forEach((v) => {
      const y = v.year || "1st Year";
      if (counts[y] !== undefined) counts[y]++;
    });
    return counts;
  }, [voters]);

  const filteredDirectoryVoters = useMemo(() => {
    return voters.filter((v) => {
      if (directoryYearFilter !== "ALL" && v.year !== directoryYearFilter) return false;
      if (directoryStatusFilter === "ELIGIBLE" && v.hasVoted) return false;
      if (directoryStatusFilter === "VOTED" && !v.hasVoted) return false;

      if (directorySearchQuery.trim()) {
        const q = directorySearchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesId = v.studentId.toLowerCase().includes(q);
        const matchesSem = v.semester?.toLowerCase().includes(q);
        return matchesName || matchesId || matchesSem;
      }
      return true;
    });
  }, [voters, directoryYearFilter, directoryStatusFilter, directorySearchQuery]);

  // Sample quick chips
  const sampleVoters = voters.slice(0, 6);

  return (
    <div className="verification-page-container fade-in" style={{ maxWidth: "1280px", margin: "0 auto", padding: "10px 16px" }}>
      {/* 1. SLIM UNIFIED TOP HEADER STRIP (~44px height, zero vertical waste) */}
      <div className="card-base" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        marginBottom: "12px",
        borderRadius: "10px",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        {/* Left: Station Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ShieldCheck size={18} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary-navy)", lineHeight: 1.2 }}>
              Verification Station #01
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Polling Officer Desk • Electoral Roll Verification
            </div>
          </div>
        </div>

        {/* Center: Live Linked EVM Terminal Beacon */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            EVM Terminal:
          </span>
          <div className={`monitor-status-box ${
            isBoothSubmitting 
              ? "monitor-submitting" 
              : isBoothUnlocked 
              ? "monitor-unlocked" 
              : "monitor-locked"
          }`} style={{ padding: "4px 10px", fontSize: "0.8rem", margin: 0 }}>
            <span className="live-dot" />
            <span className="monitor-status-text">
              {isBoothSubmitting ? (
                <>⏳ Recording Ballot...</>
              ) : isBoothUnlocked ? (
                <>
                  <Unlock size={13} /> UNLOCKED ({boothState.authorizedVoter?.name?.split(" ")[0]} in booth)
                </>
              ) : (
                <>
                  <Lock size={13} /> STANDBY / LOCKED
                </>
              )}
            </span>
          </div>

          {/* Quick Re-Lock Button */}
          {isBoothUnlocked && (
            <button
              onClick={handleRelockBooth}
              className="btn-secondary btn-sm"
              style={{ padding: "3px 8px", fontSize: "0.75rem", borderColor: "var(--danger-border)", color: "var(--danger)" }}
              title="Cancel current authorization and re-lock EVM"
            >
              <Lock size={12} /> Re-Lock EVM
            </button>
          )}
        </div>

        {/* Right: Quick Action Modals */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setIsDirectoryOpen(true)}
            className="btn-secondary btn-sm"
            style={{ fontSize: "0.8rem", padding: "5px 12px", borderRadius: "8px" }}
          >
            <BookOpen size={14} /> Student Directory ({voters.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setRegForm({
                studentId: inputQuery || "",
                name: "",
                year: "1st Year",
                semester: "1st Semester",
                course: "B.Sc Nursing",
                fatherName: ""
              });
              setIsRegisterOpen(true);
            }}
            className="btn-primary btn-sm"
            style={{ fontSize: "0.8rem", padding: "5px 12px", borderRadius: "8px" }}
          >
            <UserPlus size={14} /> + Register Student
          </button>
        </div>
      </div>

      {/* 2. COMPACT SEARCH BAR & QUICK CHIPS */}
      <div className="card-base" style={{ padding: "12px 16px", marginBottom: "12px", borderRadius: "10px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search Student Roll ID (e.g. 23961027) OR Student Name (e.g. Rahul Kumar)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                height: "42px",
                paddingLeft: "38px",
                paddingRight: "12px",
                fontSize: "0.95rem",
                borderRadius: "8px",
                border: "1.5px solid var(--border-light)",
                background: "var(--bg-card)",
                fontWeight: "500"
              }}
              autoFocus
            />
          </div>
          <button
            onClick={() => handlePerformLookup()}
            className="btn-primary"
            style={{ height: "42px", padding: "0 20px", fontSize: "0.9rem", fontWeight: "700" }}
          >
            Verify Student (↵)
          </button>
        </div>

        {/* Quick Test Chips in slim row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Quick Samples:</span>
          {sampleVoters.map((sv) => (
            <button
              key={sv.studentId}
              type="button"
              onClick={() => handleQuickSelect(sv.studentId)}
              className={`quick-chip-btn ${sv.hasVoted ? "chip-voted" : "chip-eligible"}`}
              style={{ padding: "2px 8px", fontSize: "0.75rem" }}
              title={`${sv.name} (${sv.hasVoted ? "Already Voted" : "Eligible"})`}
            >
              <span>{sv.studentId}</span>
              <span className="chip-name">({sv.name.split(" ")[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. FEEDBACK NOTIFICATION BANNER */}
      {feedbackMessage && (
        <div className={`alert-box alert-${feedbackMessage.type} fade-in`} style={{ padding: "8px 14px", marginBottom: "12px", fontSize: "0.85rem" }}>
          {feedbackMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* 4. MULTIPLE MATCHES DISAMBIGUATION VIEW (e.g. 2 students named Rahul Kumar) */}
      {currentVerification && currentVerification.status === "MULTIPLE_MATCHES" && (
        <div className="card-base fade-in" style={{ padding: "16px", marginBottom: "12px", borderRadius: "10px", border: "1.5px solid #3b82f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--primary-navy)" }}>
            <Users size={20} color="#2563eb" />
            <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
              Multiple ({currentVerification.count}) Students Found Matching "{currentVerification.query}". Please select the correct student:
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "10px" }}>
            {currentVerification.matches.map((m) => (
              <div
                key={m.studentId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-subtle)"
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{m.name}</div>
                  <div style={{ fontSize: "0.82rem", fontFamily: "monospace", color: "#2563eb", fontWeight: 700 }}>
                    Roll: {m.studentId}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {m.year} • {m.semester}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span className={`badge ${m.currentStatus === "ALREADY_VOTED" ? "badge-neutral" : "badge-success"}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                    {m.currentStatus === "ALREADY_VOTED" ? "Already Voted" : "Eligible"}
                  </span>
                  <button
                    onClick={() => handleQuickSelect(m.studentId)}
                    className="btn-primary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                  >
                    Select Student →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VERIFIED STUDENT DETAILS - COMPACT HORIZONTAL EYE-LEVEL CARD (ZERO SCROLLING NEEDED!) */}
      {currentVerification && currentVerification.voter && (
        <div className="card-base fade-in" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderRadius: "12px",
          border: currentVerification.status === "ELIGIBLE" 
            ? "2px solid #10b981" 
            : currentVerification.status === "ALREADY_VOTED" 
            ? "2px solid #ef4444" 
            : "2px solid #3b82f6",
          gap: "20px",
          flexWrap: "wrap",
          background: "var(--bg-card)"
        }}>
          {/* Left: Avatar & Verified Badge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "100px" }}>
            <img
              src={currentVerification.voter.photoUrl || DEFAULT_AVATAR}
              alt={currentVerification.voter.name}
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "12px",
                objectFit: "cover",
                border: "2px solid var(--border-light)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "0.7rem",
              fontWeight: 800,
              marginTop: "6px",
              background: currentVerification.status === "ELIGIBLE" ? "#dcfce7" : currentVerification.status === "ALREADY_VOTED" ? "#fee2e2" : "#dbeafe",
              color: currentVerification.status === "ELIGIBLE" ? "#15803d" : currentVerification.status === "ALREADY_VOTED" ? "#b91c1c" : "#1d4ed8"
            }}>
              {currentVerification.status === "ELIGIBLE" && <><CheckCircle2 size={12} /> ELIGIBLE</>}
              {currentVerification.status === "ALREADY_VOTED" && <><XCircle size={12} /> VOTED</>}
              {currentVerification.status === "IN_BOOTH" && <><Unlock size={12} /> IN BOOTH</>}
            </div>
          </div>

          {/* Center: Essential Student Information Grid */}
          <div style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "var(--primary-navy)" }}>
                {currentVerification.voter.name}
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto 1fr",
              gap: "6px 14px",
              fontSize: "0.85rem",
              background: "var(--bg-subtle)",
              padding: "10px 14px",
              borderRadius: "8px",
              alignItems: "center"
            }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Student ID:</span>
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "0.95rem", color: "#2563eb" }}>
                {currentVerification.voter.studentId}
              </span>

              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Program:</span>
              <span style={{ fontWeight: 600 }}>{currentVerification.voter.course}</span>

              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Year / Sem:</span>
              <span style={{ fontWeight: 600 }}>{currentVerification.voter.year} • {currentVerification.voter.semester}</span>

              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Father:</span>
              <span>{currentVerification.voter.fatherName || "N/A"}</span>
            </div>
          </div>

          {/* Right: Direct Action Area Right At Eye Level (NO SCROLLING!) */}
          <div style={{ display: "flex", alignItems: "center", minWidth: "250px", justifyContent: "center" }}>
            {currentVerification.status === "ELIGIBLE" && (
              <button
                onClick={() => handleAuthorize()}
                className="btn-success"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 22px",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  boxShadow: "0 6px 18px rgba(16, 185, 129, 0.35)",
                  cursor: "pointer"
                }}
              >
                <Unlock size={22} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.15 }}>
                  <span>AUTHORIZE FOR BOOTH</span>
                  <span style={{ fontSize: "0.72rem", opacity: 0.9, fontWeight: 500 }}>Press ENTER ↵ to Unlock EVM</span>
                </div>
                <ArrowRight size={18} />
              </button>
            )}

            {currentVerification.status === "IN_BOOTH" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "0.85rem", fontWeight: 700 }}>
                  <Radio size={16} className="animate-pulse" />
                  <span>Voter Currently Inside EVM Booth</span>
                </div>
                <button
                  onClick={handleRelockBooth}
                  className="btn-secondary text-danger"
                  style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                >
                  <RotateCcw size={14} /> Cancel & Re-Lock EVM
                </button>
              </div>
            )}

            {currentVerification.status === "ALREADY_VOTED" && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 800, fontSize: "0.88rem" }}>
                  <XCircle size={16} /> Ballot Already Cast
                </div>
                <span style={{ fontSize: "0.75rem", color: "#7f1d1d", marginTop: "2px" }}>
                  Polled at {new Date(currentVerification.voter.votedAt || Date.now()).toLocaleTimeString()}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#991b1b" }}>Duplicate voting strictly blocked</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. NOT FOUND STATE */}
      {currentVerification && currentVerification.status === "NOT_FOUND" && (
        <div className="card-base fade-in" style={{ padding: "16px", borderRadius: "10px", border: "1.5px solid #f87171", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#dc2626", fontWeight: 800 }}>
            <XCircle size={22} />
            <span>Student Record Not Found for "{currentVerification.query || inputQuery}"</span>
          </div>
          <p style={{ margin: "6px 0 12px 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            No student matching this ID/Name in the official register. You can quickly register them now:
          </p>
          <button
            type="button"
            onClick={() => {
              setRegForm({
                studentId: inputQuery.trim().toUpperCase(),
                name: "",
                year: "1st Year",
                semester: "1st Semester",
                course: "B.Sc Nursing",
                fatherName: ""
              });
              setIsRegisterOpen(true);
            }}
            className="btn-primary btn-sm"
          >
            <UserPlus size={14} /> Register "{inputQuery}" to Electoral Roll Now
          </button>
        </div>
      )}

      {/* MODAL 1: STUDENT DIRECTORY (YEAR-WISE) */}
      <Modal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        size="xl"
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BookOpen size={20} className="text-primary" />
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Electoral Roll Student Directory</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Total {voters.length} Registered Students • Filter by Academic Year or Search by Name/Roll Number
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDirectoryOpen(false)}
            className="btn-icon"
            aria-label="Close directory"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-pad" style={{ padding: "16px 24px" }}>
          {/* Year Tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: `All Students (${directoryYearStats["ALL"]})` },
              { id: "1st Year", label: `1st Year (${directoryYearStats["1st Year"]})` },
              { id: "2nd Year", label: `2nd Year (${directoryYearStats["2nd Year"]})` },
              { id: "3rd Year", label: `3rd Year (${directoryYearStats["3rd Year"]})` },
              { id: "4th Year", label: `4th Year (${directoryYearStats["4th Year"]})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDirectoryYearFilter(tab.id)}
                className={`btn-sm ${directoryYearFilter === tab.id ? "btn-primary" : "btn-secondary"}`}
                style={{ borderRadius: "20px" }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Status Filters */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "14px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={directorySearchQuery}
                onChange={(e) => setDirectorySearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: "32px", paddingRight: "10px", height: "36px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}
              />
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setDirectoryStatusFilter("ALL")}
                className={`btn-sm ${directoryStatusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.75rem" }}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setDirectoryStatusFilter("ELIGIBLE")}
                className={`btn-sm ${directoryStatusFilter === "ELIGIBLE" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.75rem" }}
              >
                Eligible Only
              </button>
              <button
                type="button"
                onClick={() => setDirectoryStatusFilter("VOTED")}
                className={`btn-sm ${directoryStatusFilter === "VOTED" ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.75rem" }}
              >
                Voted Only
              </button>
            </div>
          </div>

          {/* Directory Table */}
          <div style={{ maxHeight: "380px", overflowY: "auto", border: "1px solid var(--border-light)", borderRadius: "8px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-light)", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px" }}>Roll / Student ID</th>
                  <th style={{ padding: "10px 12px" }}>Student Name</th>
                  <th style={{ padding: "10px 12px" }}>Academic Year / Sem</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDirectoryVoters.map((v) => (
                  <tr key={v.studentId} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 700 }}>
                      {v.studentId}
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                      {v.name}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>
                      {v.year} • {v.semester}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {v.hasVoted ? (
                        <span className="badge badge-success" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={12} /> Voted
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                          Eligible
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => {
                          handleQuickSelect(v.studentId);
                          setIsDirectoryOpen(false);
                        }}
                        className={`btn-sm ${v.hasVoted ? "btn-secondary" : "btn-primary"}`}
                        style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                      >
                        {v.hasVoted ? "View Status" : "Verify & Select"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredDirectoryVoters.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      No registered students found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Showing {filteredDirectoryVoters.length} of {voters.length} registered students
          </span>
          <button
            onClick={() => setIsDirectoryOpen(false)}
            className="btn-secondary btn-sm"
          >
            Close Directory
          </button>
        </div>
      </Modal>

      {/* MODAL 2: QUICK REGISTER MISSING STUDENT */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        size="md"
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserPlus size={20} className="text-primary" />
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Quick Register Missing Student</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Add an unregistered student directly to the electoral roll for instant verification & voting.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRegisterOpen(false)}
            className="btn-icon"
            aria-label="Close registration"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleRegisterSubmit}>
          <div className="modal-body-pad" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px 24px" }}>
            {regError && (
              <div className="alert-box alert-error" style={{ fontSize: "0.85rem", padding: "8px 12px" }}>
                <AlertTriangle size={16} />
                <span>{regError}</span>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                Student Roll / ID Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 23962055"
                value={regForm.studentId}
                onChange={(e) => setRegForm({ ...regForm, studentId: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--bg-card)", fontFamily: "monospace" }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                Full Student Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Academic Year *
                </label>
                <select
                  value={regForm.year}
                  onChange={(e) => handleYearChangeInRegister(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Semester *
                </label>
                <select
                  value={regForm.semester}
                  onChange={(e) => setRegForm({ ...regForm, semester: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Program / Course
                </label>
                <input
                  type="text"
                  value={regForm.course}
                  onChange={(e) => setRegForm({ ...regForm, course: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Father's Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={regForm.fatherName}
                  onChange={(e) => setRegForm({ ...regForm, fatherName: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 24px" }}>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <UserPlus size={16} /> Save & Verify Student
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
