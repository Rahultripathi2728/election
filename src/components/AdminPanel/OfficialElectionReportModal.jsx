import React, { useState, useMemo } from "react";
import { Modal } from "../common/Modal";
import { 
  Printer, 
  Download, 
  X, 
  Award, 
  Users, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Filter,
  ShieldCheck,
  Vote
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";

export const OfficialElectionReportModal = ({ isOpen, onClose }) => {
  const { positions, candidates, voters, ballots, electionConfig } = useElection();

  const [yearFilter, setYearFilter] = useState("ALL"); // ALL | 1st Year | 2nd Year | 3rd Year | 4th Year
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | VOTED | ABSENT

  // Map of ballots by studentId
  const ballotsByStudentId = useMemo(() => {
    const map = {};
    ballots.forEach((b) => {
      if (b.voterId) {
        map[b.voterId.toUpperCase()] = b;
      }
    });
    return map;
  }, [ballots]);

  // Turnout Metrics
  const totalVoters = voters.length;
  const votedVoters = voters.filter((v) => v.hasVoted);
  const absentVoters = voters.filter((v) => !v.hasVoted);
  const turnoutPercent = totalVoters > 0 ? ((votedVoters.length / totalVoters) * 100).toFixed(1) : 0;

  // Year-wise Turnout Breakdown
  const yearStats = useMemo(() => {
    const stats = {
      "1st Year": { total: 0, voted: 0 },
      "2nd Year": { total: 0, voted: 0 },
      "3rd Year": { total: 0, voted: 0 },
      "4th Year": { total: 0, voted: 0 }
    };
    voters.forEach((v) => {
      const y = v.year || "1st Year";
      if (!stats[y]) stats[y] = { total: 0, voted: 0 };
      stats[y].total++;
      if (v.hasVoted) stats[y].voted++;
    });
    return stats;
  }, [voters]);

  // Candidate Results & Winners per Position
  const resultsByPosition = useMemo(() => {
    return positions.map((pos) => {
      const posCandidates = candidates
        .filter((c) => c.positionId === pos.id)
        .map((c) => ({
          ...c,
          voteCount: c.votes || 0
        }))
        .sort((a, b) => b.voteCount - a.voteCount);

      // NOTA count for this position
      let notaCount = 0;
      ballots.forEach((b) => {
        if (b.selections?.[pos.id] === "NOTA") notaCount++;
      });

      const totalVotesPolled = posCandidates.reduce((acc, c) => acc + c.voteCount, 0) + notaCount;
      const winner = posCandidates[0] && posCandidates[0].voteCount > 0 ? posCandidates[0] : null;
      const runnerUp = posCandidates[1] || null;
      const margin = winner && runnerUp ? winner.voteCount - runnerUp.voteCount : winner ? winner.voteCount : 0;

      return {
        position: pos,
        candidates: posCandidates,
        notaCount,
        totalVotesPolled,
        winner,
        margin
      };
    });
  }, [positions, candidates, ballots]);

  // Filtered Students for the Detailed Ledger Table
  const filteredStudents = useMemo(() => {
    return voters.filter((v) => {
      const voterYear = v.year || "1st Year";
      if (yearFilter !== "ALL" && voterYear !== yearFilter) return false;
      if (statusFilter === "VOTED" && !v.hasVoted) return false;
      if (statusFilter === "ABSENT" && v.hasVoted) return false;
      return true;
    }).sort((a, b) => {
      // Sort by Year sequence, then Name
      const yearOrder = { "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4 };
      const diff = (yearOrder[a.year] || 9) - (yearOrder[b.year] || 9);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [voters, yearFilter, statusFilter]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let csv = `Official Election Audit Report - ${electionConfig.institution}\n`;
    csv += `Title: ${electionConfig.title}, Generated: ${new Date().toLocaleString()}\n`;
    csv += `Total Voters: ${totalVoters}, Ballots Cast: ${votedVoters.length} (${turnoutPercent}%), Absentees: ${absentVoters.length}\n\n`;

    csv += "--- CANDIDATE RESULTS & WINNERS ---\n";
    resultsByPosition.forEach(({ position, candidates: cands, notaCount, winner, margin }) => {
      csv += `Position: ${position.title}\n`;
      cands.forEach((c) => {
        csv += `  - ${c.name} (${c.rollNo || "N/A"}): ${c.voteCount} votes ${winner?.id === c.id ? `[WINNER by +${margin} votes]` : ""}\n`;
      });
      csv += `  - NOTA: ${notaCount} votes\n`;
    });
    csv += "\n";

    csv += "--- DETAILED STUDENT BALLOTS & CHOICES LEDGER ---\n";
    csv += "S.No,Student ID,Student Name,Academic Year,Semester,Status,";
    positions.forEach((p) => {
      csv += `"${p.title}",`;
    });
    csv += "Polled Timestamp\n";

    filteredStudents.forEach((v, idx) => {
      const ballot = ballotsByStudentId[v.studentId.toUpperCase()];
      csv += `${idx + 1},"${v.studentId}","${v.name}","${v.year}","${v.semester}","${v.hasVoted ? "VOTED" : "ABSENT"}",`;

      positions.forEach((p) => {
        if (!ballot) {
          csv += `"ABSENT",`;
        } else {
          const choiceId = ballot.selections?.[p.id];
          if (choiceId === "NOTA") {
            csv += `"NOTA",`;
          } else {
            const cand = candidates.find((c) => c.id === choiceId);
            csv += `"${cand ? cand.name : "N/A"}",`;
          }
        }
      });

      csv += `"${ballot ? ballot.timestamp : "N/A"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Official_Election_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {/* Modal Actions Bar (Hidden in Print) */}
      <div className="report-modal-header no-print">
        <div className="report-header-title-box">
          <FileText size={22} className="text-primary" />
          <div>
            <h3>Official Election Results & Master Ballot Audit Report</h3>
            <p>Certified college administration document with candidate winners, participation metrics, and individual voter choices.</p>
          </div>
        </div>

        <div className="report-header-btn-group">
          {/* Year Filter */}
          <select 
            value={yearFilter} 
            onChange={(e) => setYearFilter(e.target.value)}
            className="report-filter-select"
          >
            <option value="ALL">All Academic Years</option>
            <option value="1st Year">1st Year (1st Sem)</option>
            <option value="2nd Year">2nd Year (3rd Sem)</option>
            <option value="3rd Year">3rd Year (5th Sem)</option>
            <option value="4th Year">4th Year (7th Sem)</option>
          </select>

          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="report-filter-select"
          >
            <option value="ALL">All Students ({voters.length})</option>
            <option value="VOTED">Voted Only ({votedVoters.length})</option>
            <option value="ABSENT">Absent Only ({absentVoters.length})</option>
          </select>

          <button onClick={handleExportCSV} className="btn-secondary" title="Export CSV Data">
            <Download size={16} /> Export CSV
          </button>

          <button onClick={handlePrint} className="btn-primary" title="Print / Save PDF">
            <Printer size={16} /> Print / Save as PDF
          </button>

          <button onClick={onClose} className="modal-close-btn" type="button">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Printable Document Body */}
      <div className="official-report-document-container printable-report-body">
        {/* Document Header */}
        <div className="report-doc-letterhead">
          <div className="letterhead-crest">
            <Vote size={36} color="#1e3a8a" />
          </div>
          <div className="letterhead-text">
            <h1 className="letterhead-institution">{electionConfig.institution || "Graphic Era Hill University"}</h1>
            <h2 className="letterhead-faculty">FACULTY OF NURSING • CENTRAL STUDENT COUNCIL ELECTIONS 2026</h2>
            <p className="letterhead-meta">
              Official Master Ballot Ledger & Election Scrutiny Certification • Date: <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </p>
          </div>
        </div>

        <div className="report-doc-divider" />

        {/* SECTION 1: EXECUTIVE STANDINGS & WINNERS */}
        <div className="report-doc-section">
          <h3 className="section-title">
            <Award size={18} /> SECTION I: OFFICIAL RESULTS & ELECTED CANDIDATES
          </h3>
          
          <table className="report-table results-summary-table">
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Electoral Position</th>
                <th style={{ width: "35%" }}>Contesting Nominees & Vote Tally</th>
                <th style={{ width: "12%" }}>NOTA</th>
                <th style={{ width: "13%" }}>Total Polled</th>
                <th style={{ width: "20%" }}>Official Outcome</th>
              </tr>
            </thead>
            <tbody>
              {resultsByPosition.map(({ position, candidates: cands, notaCount, totalVotesPolled, winner, margin }) => (
                <tr key={position.id}>
                  <td className="font-bold text-slate-900">{position.title}</td>
                  <td>
                    <div className="candidates-tally-list">
                      {cands.map((c) => (
                        <div key={c.id} className={`tally-row ${winner?.id === c.id ? "winner-tally" : ""}`}>
                          <span className="cand-t-name">{c.name} ({c.rollNo || "N/A"})</span>
                          <span className="cand-t-votes font-mono font-bold">{c.voteCount} votes</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="font-mono text-center">{notaCount}</td>
                  <td className="font-mono text-center font-bold">{totalVotesPolled}</td>
                  <td>
                    {winner ? (
                      <div className="winner-cell-badge">
                        <span className="winner-name">🏆 {winner.name}</span>
                        <span className="winner-margin">Won by +{margin} votes</span>
                      </div>
                    ) : (
                      <span className="text-muted">No Votes Polled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 2: PARTICIPATION & TURNOUT METRICS */}
        <div className="report-doc-section">
          <h3 className="section-title">
            <Users size={18} /> SECTION II: VOTER TURNOUT & ACADEMIC YEAR PARTICIPATION
          </h3>

          <div className="report-metrics-grid">
            <div className="metric-box">
              <span className="m-num">{totalVoters}</span>
              <span className="m-lbl">Total Registered Students</span>
            </div>
            <div className="metric-box">
              <span className="m-num text-emerald">{votedVoters.length}</span>
              <span className="m-lbl">Official Ballots Cast</span>
            </div>
            <div className="metric-box">
              <span className="m-num text-rose">{absentVoters.length}</span>
              <span className="m-lbl">Absentees / Non-Voters</span>
            </div>
            <div className="metric-box highlight">
              <span className="m-num text-blue">{turnoutPercent}%</span>
              <span className="m-lbl">Overall Turnout Rate</span>
            </div>
          </div>

          <table className="report-table year-turnout-table" style={{ marginTop: "0.75rem" }}>
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Target Semester</th>
                <th>Total Registered</th>
                <th>Ballots Cast</th>
                <th>Absentees</th>
                <th>Participation Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">1st Academic Year</td>
                <td>1st Semester</td>
                <td className="font-mono">{yearStats["1st Year"].total}</td>
                <td className="font-mono font-bold text-emerald">{yearStats["1st Year"].voted}</td>
                <td className="font-mono text-rose">{yearStats["1st Year"].total - yearStats["1st Year"].voted}</td>
                <td className="font-bold">
                  {yearStats["1st Year"].total > 0 ? ((yearStats["1st Year"].voted / yearStats["1st Year"].total) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr>
                <td className="font-bold">2nd Academic Year</td>
                <td>3rd Semester</td>
                <td className="font-mono">{yearStats["2nd Year"].total}</td>
                <td className="font-mono font-bold text-emerald">{yearStats["2nd Year"].voted}</td>
                <td className="font-mono text-rose">{yearStats["2nd Year"].total - yearStats["2nd Year"].voted}</td>
                <td className="font-bold">
                  {yearStats["2nd Year"].total > 0 ? ((yearStats["2nd Year"].voted / yearStats["2nd Year"].total) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr>
                <td className="font-bold">3rd Academic Year</td>
                <td>5th Semester</td>
                <td className="font-mono">{yearStats["3rd Year"].total}</td>
                <td className="font-mono font-bold text-emerald">{yearStats["3rd Year"].voted}</td>
                <td className="font-mono text-rose">{yearStats["3rd Year"].total - yearStats["3rd Year"].voted}</td>
                <td className="font-bold">
                  {yearStats["3rd Year"].total > 0 ? ((yearStats["3rd Year"].voted / yearStats["3rd Year"].total) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr>
                <td className="font-bold">4th Academic Year</td>
                <td>7th Semester</td>
                <td className="font-mono">{yearStats["4th Year"].total}</td>
                <td className="font-mono font-bold text-emerald">{yearStats["4th Year"].voted}</td>
                <td className="font-mono text-rose">{yearStats["4th Year"].total - yearStats["4th Year"].voted}</td>
                <td className="font-bold">
                  {yearStats["4th Year"].total > 0 ? ((yearStats["4th Year"].voted / yearStats["4th Year"].total) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 3: COMPREHENSIVE STUDENT-BY-STUDENT CHOICES AUDIT LEDGER */}
        <div className="report-doc-section">
          <h3 className="section-title">
            <ShieldCheck size={18} /> SECTION III: COMPREHENSIVE STUDENT BALLOT LEDGER & CHOICES
          </h3>
          <p className="section-subtitle">
            Complete transparent audit record showing candidate selected for each position by individual registered student voters.
          </p>

          <table className="report-table student-ledger-table">
            <thead>
              <tr>
                <th style={{ width: "4%" }}>#</th>
                <th style={{ width: "10%" }}>Student ID</th>
                <th style={{ width: "16%" }}>Student Name</th>
                <th style={{ width: "10%" }}>Class / Year</th>
                <th style={{ width: "7%" }}>Status</th>
                {positions.map((p) => (
                  <th key={p.id} style={{ width: `${45 / positions.length}%` }}>
                    {p.title}
                  </th>
                ))}
                <th style={{ width: "8%" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((v, idx) => {
                const ballot = ballotsByStudentId[v.studentId.toUpperCase()];
                return (
                  <tr key={v.studentId} className={v.hasVoted ? "row-voted" : "row-absent"}>
                    <td className="text-center font-mono">{idx + 1}</td>
                    <td className="font-mono font-bold">{v.studentId}</td>
                    <td className="font-semibold text-slate-900">{v.name}</td>
                    <td>{v.year} ({v.semester})</td>
                    <td>
                      {v.hasVoted ? (
                        <span className="badge-voted">VOTED</span>
                      ) : (
                        <span className="badge-absent">ABSENT</span>
                      )}
                    </td>

                    {positions.map((p) => {
                      if (!v.hasVoted || !ballot) {
                        return (
                          <td key={p.id} className="text-muted font-italic">
                            —
                          </td>
                        );
                      }
                      const choiceId = ballot.selections?.[p.id];
                      if (choiceId === "NOTA") {
                        return (
                          <td key={p.id} className="choice-nota">
                            NOTA
                          </td>
                        );
                      }
                      const cand = candidates.find((c) => c.id === choiceId);
                      return (
                        <td key={p.id} className="choice-cand font-medium">
                          {cand ? cand.name : "N/A"}
                        </td>
                      );
                    })}

                    <td className="font-mono text-xs text-muted">
                      {ballot ? new Date(ballot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SECTION 4: CERTIFICATION SIGNATURES */}
        <div className="report-doc-signatures">
          <div className="sig-block">
            <div className="sig-line" />
            <span className="sig-name">Presiding Polling Officer</span>
            <span className="sig-title">Verification Station #01</span>
          </div>

          <div className="sig-block">
            <div className="sig-line" />
            <span className="sig-name">Chief Returning Officer (Admin)</span>
            <span className="sig-title">Campus Electoral Commission</span>
          </div>

          <div className="sig-block">
            <div className="sig-line" />
            <span className="sig-name">Head of Department / Dean</span>
            <span className="sig-title">Faculty of Nursing</span>
          </div>
        </div>

        <div className="report-footer-seal">
          <span>Official Digital Stamp: E-VOTE-COUNCIL-2026-SEAL-VERIFIED • End of Certified Report</span>
        </div>
      </div>
    </Modal>
  );
};
