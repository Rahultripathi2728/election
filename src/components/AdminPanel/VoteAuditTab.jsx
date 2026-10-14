import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  Vote, 
  Layers, 
  Printer, 
  ChevronRight, 
  FileSpreadsheet, 
  Award,
  ArrowUpDown,
  GraduationCap
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { DEFAULT_AVATAR } from "../../utils/constants";
import { OfficialElectionReportModal } from "./OfficialElectionReportModal";

export const VoteAuditTab = () => {
  const { positions, candidates, ballots, voters, electionConfig } = useElection();

  const [showReportModal, setShowReportModal] = useState(false);
  const [activeMode, setActiveMode] = useState("CANDIDATE_INSPECTOR"); // "CANDIDATE_INSPECTOR" | "FULL_LEDGER"
  const [selectedPosId, setSelectedPosId] = useState(positions[0]?.id || "");
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  
  // Filters
  const [yearFilter, setYearFilter] = useState("ALL"); // ALL | 1st Year | 2nd Year | 3rd Year | 4th Year
  const [searchQuery, setSearchQuery] = useState("");

  const currentPosition = positions.find((p) => p.id === selectedPosId) || positions[0];
  const positionCandidates = candidates.filter((c) => c.positionId === (currentPosition?.id || ""));

  // Select first candidate by default if none selected or changed
  const activeCandidate = useMemo(() => {
    if (selectedCandidateId) {
      const found = positionCandidates.find((c) => c.id === selectedCandidateId);
      if (found) return found;
    }
    return positionCandidates[0] || null;
  }, [selectedCandidateId, positionCandidates]);

  // Turnout by Year Metrics
  const yearBreakdown = useMemo(() => {
    const stats = { "1st Year": 0, "2nd Year": 0, "3rd Year": 0, "4th Year": 0 };
    ballots.forEach((b) => {
      if (stats[b.year] !== undefined) {
        stats[b.year]++;
      }
    });
    return stats;
  }, [ballots]);

  // Ballots for currently selected candidate
  const candidateVoters = useMemo(() => {
    if (!activeCandidate || !currentPosition) return [];
    
    return ballots.filter((b) => {
      const votedCandId = b.selections?.[currentPosition.id];
      const isMatch = votedCandId === activeCandidate.id;
      if (!isMatch) return false;

      // Filter by Year
      if (yearFilter !== "ALL" && b.year !== yearFilter) return false;

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.voterName?.toLowerCase().includes(q);
        const matchesId = b.voterId?.toLowerCase().includes(q);
        const matchesCourse = b.course?.toLowerCase().includes(q);
        return matchesName || matchesId || matchesCourse;
      }

      return true;
    });
  }, [activeCandidate, currentPosition, ballots, yearFilter, searchQuery]);

  // All filtered ballots for the full ledger
  const filteredLedger = useMemo(() => {
    return ballots.filter((b) => {
      if (yearFilter !== "ALL" && b.year !== yearFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.voterName?.toLowerCase().includes(q);
        const matchesId = b.voterId?.toLowerCase().includes(q);
        const matchesCourse = b.course?.toLowerCase().includes(q);
        return matchesName || matchesId || matchesCourse;
      }
      return true;
    });
  }, [ballots, yearFilter, searchQuery]);

  // Export Candidate-Specific Voters CSV
  const handleExportCandidateCSV = () => {
    if (!activeCandidate || !currentPosition) return;

    let csv = `Ballot Audit Report - ${currentPosition.title} - ${activeCandidate.name}\n`;
    csv += `Candidate Roll: ${activeCandidate.rollNo}, Department: ${activeCandidate.department}, Total Polled: ${candidateVoters.length}\n\n`;
    csv += "Voter ID,Voter Name,Father Name,Academic Year,Semester,Course/Branch,Booth ID,Polled Timestamp\n";

    candidateVoters.forEach((b) => {
      csv += `"${b.voterId}","${b.voterName}","${b.fatherName || "N/A"}","${b.year}","${b.semester}","${b.course}","${b.boothId}","${b.timestamp}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Voter_Audit_${activeCandidate.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Complete Master Ballot Ledger CSV
  const handleExportFullLedgerCSV = () => {
    let csv = `Complete Student Ballots Audit Ledger - ${electionConfig.institution} (${electionConfig.title})\n`;
    csv += "Ballot ID,Voter ID,Student Name,Father Name,Academic Year,Semester,Course,";
    
    positions.forEach((p) => {
      csv += `"${p.title}",`;
    });
    csv += "Booth ID,Timestamp\n";

    filteredLedger.forEach((b) => {
      csv += `"${b.id}","${b.voterId}","${b.voterName}","${b.fatherName || "N/A"}","${b.year}","${b.semester}","${b.course}",`;
      
      positions.forEach((p) => {
        const selectedId = b.selections?.[p.id];
        if (selectedId === "NOTA") {
          csv += `"NOTA",`;
        } else {
          const cand = candidates.find((c) => c.id === selectedId);
          csv += `"${cand ? cand.name : "N/A"}",`;
        }
      });

      csv += `"${b.boothId}","${b.timestamp}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Master_Ballots_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-subtab-container fade-in">
      {/* Header */}
      <div className="subtab-header">
        <div>
          <h2 className="subtab-title">Vote Transparency & Student Choices Audit</h2>
          <p className="subtab-desc">
            Inspect individual student ballot choices per candidate, filter by academic year/semester, and download verification audit records.
          </p>
        </div>
        <div className="subtab-header-actions">
          {activeMode === "CANDIDATE_INSPECTOR" ? (
            <button onClick={handleExportCandidateCSV} className="btn-secondary">
              <Download size={16} />
              <span>Export {activeCandidate?.name?.split(" ")[0]}'s Voters CSV</span>
            </button>
          ) : (
            <button onClick={handleExportFullLedgerCSV} className="btn-secondary">
              <FileSpreadsheet size={16} />
              <span>Export Master Ledger CSV</span>
            </button>
          )}
          <button onClick={() => setShowReportModal(true)} className="btn-primary">
            <Printer size={16} />
            <span>Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Year Turnout Statistics Bar */}
      <div className="turnout-stats-strip-grid card-base">
        <div className="ts-item">
          <span className="ts-label">Total Ballots Cast</span>
          <span className="ts-val text-primary">{ballots.length}</span>
        </div>
        <div className="ts-item">
          <span className="ts-label">1st Year Turnout</span>
          <span className="ts-val">{yearBreakdown["1st Year"]} votes</span>
        </div>
        <div className="ts-item">
          <span className="ts-label">2nd Year Turnout</span>
          <span className="ts-val">{yearBreakdown["2nd Year"]} votes</span>
        </div>
        <div className="ts-item">
          <span className="ts-label">3rd Year Turnout</span>
          <span className="ts-val">{yearBreakdown["3rd Year"]} votes</span>
        </div>
        <div className="ts-item">
          <span className="ts-label">4th Year Turnout</span>
          <span className="ts-val">{yearBreakdown["4th Year"]} votes</span>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="audit-mode-selector">
        <button
          onClick={() => setActiveMode("CANDIDATE_INSPECTOR")}
          className={`mode-btn ${activeMode === "CANDIDATE_INSPECTOR" ? "active" : ""}`}
        >
          <Award size={18} />
          <span>Candidate Vote Inspector (Who Voted for Whom)</span>
        </button>
        <button
          onClick={() => setActiveMode("FULL_LEDGER")}
          className={`mode-btn ${activeMode === "FULL_LEDGER" ? "active" : ""}`}
        >
          <FileSpreadsheet size={18} />
          <span>Complete Ballots Ledger (All Votes by Student)</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeMode === "CANDIDATE_INSPECTOR" ? (
        <div className="candidate-inspector-layout">
          {/* 1. Position Navigation Bar */}
          <div className="filter-bar">
            <span className="filter-label">Select Electoral Post:</span>
            {positions.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPosId(p.id);
                  const firstCand = candidates.find((c) => c.positionId === p.id);
                  if (firstCand) setSelectedCandidateId(firstCand.id);
                }}
                className={`filter-pill ${currentPosition?.id === p.id ? "active" : ""}`}
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* 2. Candidate Cards Strip for this Position */}
          <div className="candidate-selector-row">
            {positionCandidates.map((c) => {
              const isSelected = activeCandidate?.id === c.id;
              const candVoteCount = ballots.filter(
                (b) => b.selections?.[currentPosition.id] === c.id
              ).length;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`candidate-select-card card-base ${isSelected ? "selected" : ""}`}
                >
                  <div className="csc-avatar-wrap">
                    <img 
                      src={c.avatarUrl || DEFAULT_AVATAR} 
                      alt={c.name} 
                      className="csc-avatar" 
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    {c.symbolIcon ? <span className="csc-symbol">{c.symbolIcon}</span> : null}
                  </div>
                  <div className="csc-info">
                    <h4 className="csc-name">{c.name}</h4>
                    <span className="csc-dept">{c.department}</span>
                    <div className="csc-tally">
                      <strong>{candVoteCount}</strong> verified votes
                    </div>
                  </div>
                  {isSelected && <div className="csc-active-indicator"><CheckCircle2 size={16} /></div>}
                </div>
              );
            })}
          </div>

          {/* 3. Filter Bar for Voters (Year & Search) */}
          <div className="voter-filter-strip card-base">
            <div className="search-wrap">
              <Search size={16} className="search-icon text-muted" />
              <input
                type="text"
                placeholder="Search voter by student name, ID or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-input"
              />
            </div>

            <div className="year-filter-pills">
              <span className="filter-label">Filter Academic Year:</span>
              {["ALL", "1st Year", "2nd Year", "3rd Year", "4th Year"].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setYearFilter(yr)}
                  className={`filter-pill ${yearFilter === yr ? "active" : ""}`}
                >
                  {yr === "ALL" ? "All Years" : yr}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Voters List for Selected Candidate */}
          <div className="voters-table-card card-base">
            <div className="table-header-title">
              <div className="flex-row items-center gap-2">
                <Users size={18} color="#2563eb" />
                <h3>
                  Students who voted for <strong>{activeCandidate?.name}</strong> ({currentPosition?.title})
                </h3>
              </div>
              <span className="badge badge-success">
                {candidateVoters.length} Matching Student Voters
              </span>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Voter Full Name</th>
                    <th>Father Name</th>
                    <th>Academic Year</th>
                    <th>Semester</th>
                    <th>Department / Branch</th>
                    <th>Station / Booth</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateVoters.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span className="font-mono text-bold text-primary">{b.voterId}</span>
                      </td>
                      <td>
                        <div className="voter-name-cell">
                          <strong>{b.voterName}</strong>
                        </div>
                      </td>
                      <td className="text-muted">{b.fatherName || "N/A"}</td>
                      <td>
                        <span className={`badge ${
                          b.year === "1st Year" ? "badge-blue" :
                          b.year === "2nd Year" ? "badge-neutral" :
                          b.year === "3rd Year" ? "badge-warning" : "badge-success"
                        }`}>
                          {b.year}
                        </span>
                      </td>
                      <td>{b.semester}</td>
                      <td>{b.course}</td>
                      <td>
                        <span className="booth-tag">{b.boothId}</span>
                      </td>
                      <td className="text-sm text-muted">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                    </tr>
                  ))}

                  {candidateVoters.length === 0 && (
                    <tr>
                      <td colSpan={8} className="empty-cell">
                        No student voters found matching this filter for {activeCandidate?.name}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Full Master Ballot Ledger View */
        <div className="full-ledger-layout">
          {/* Filter Bar for Master Ledger */}
          <div className="voter-filter-strip card-base">
            <div className="search-wrap">
              <Search size={16} className="search-icon text-muted" />
              <input
                type="text"
                placeholder="Search student by name, ID or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-input"
              />
            </div>

            <div className="year-filter-pills">
              <span className="filter-label">Filter Academic Year:</span>
              {["ALL", "1st Year", "2nd Year", "3rd Year", "4th Year"].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setYearFilter(yr)}
                  className={`filter-pill ${yearFilter === yr ? "active" : ""}`}
                >
                  {yr === "ALL" ? "All Years" : yr}
                </button>
              ))}
            </div>
          </div>

          <div className="voters-table-card card-base">
            <div className="table-header-title">
              <div className="flex-row items-center gap-2">
                <FileSpreadsheet size={18} color="#2563eb" />
                <h3>Master Chronological Ballot Ledger ({filteredLedger.length} Records)</h3>
              </div>
              <button onClick={handleExportFullLedgerCSV} className="btn-secondary btn-sm">
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ballot ID</th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Year & Sem</th>
                    {positions.map((p) => (
                      <th key={p.id}>{p.title} Selection</th>
                    ))}
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedger.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono text-sm text-muted">{b.id.slice(-8)}</td>
                      <td>
                        <span className="font-mono text-bold text-primary">{b.voterId}</span>
                      </td>
                      <td>
                        <strong>{b.voterName}</strong>
                        <div className="text-xs text-muted">{b.course}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{b.year}</span>
                        <span className="text-xs text-muted ml-1">({b.semester})</span>
                      </td>
                      {positions.map((p) => {
                        const chosenCandId = b.selections?.[p.id];
                        const cand = candidates.find((c) => c.id === chosenCandId);
                        return (
                          <td key={p.id}>
                            {chosenCandId === "NOTA" ? (
                              <span className="badge badge-danger">NOTA</span>
                            ) : cand ? (
                              <div className="flex-row items-center gap-1">
                                <span>{cand.symbolIcon}</span>
                                <span className="font-semibold">{cand.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-sm text-muted">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                    </tr>
                  ))}

                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan={5 + positions.length} className="empty-cell">
                        No ballots recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Election PDF Report Modal */}
      <OfficialElectionReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};
