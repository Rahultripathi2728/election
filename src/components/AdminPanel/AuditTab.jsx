import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Filter, 
  CheckCircle2, 
  Award,
  AlertCircle
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";

export const AuditTab = () => {
  const { auditLogs, electionConfig, positions, candidates, voters } = useElection();
  const [filterAction, setFilterAction] = useState("ALL");

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;

  const filteredLogs = filterAction === "ALL" 
    ? auditLogs 
    : auditLogs.filter((log) => log.action.includes(filterAction));

  // Export Results Tally CSV
  const handleExportResultsCSV = () => {
    let csv = "Electoral Post,Candidate Name,Roll No,Department,Votes Received,Status\n";
    positions.forEach((pos) => {
      const posCandidates = candidates
        .filter((c) => c.positionId === pos.id)
        .sort((a, b) => (b.votes || 0) - (a.votes || 0));

      const maxVotes = posCandidates[0]?.votes || 0;

      posCandidates.forEach((c) => {
        const isLeading = c.votes === maxVotes && maxVotes > 0;
        csv += `"${pos.title}","${c.name}","${c.rollNo}","${c.department}",${c.votes || 0},"${isLeading ? "Elected/Leading" : "Runner Up"}"\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `election_results_tally_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Comprehensive Audit Logs CSV
  const handleExportAuditLogs = () => {
    let csv = "Log ID,Timestamp (ISO),Action Event,Actor / Station,Audit Details\n";
    auditLogs.forEach((log) => {
      csv += `"${log.id}","${log.timestamp}","${log.action}","${log.actor}","${log.details.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `election_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="admin-subtab-container fade-in">
      {/* Subtab Header */}
      <div className="subtab-header">
        <div>
          <h2 className="subtab-title">Audit Trail & Official Certification</h2>
          <p className="subtab-desc">
            Immutable electoral ledger, tamper-evident action logs, and official certificate generation for institutional records.
          </p>
        </div>
        <div className="subtab-header-actions">
          <button onClick={handleExportResultsCSV} className="btn-secondary">
            <Download size={16} />
            <span>Export Tally CSV</span>
          </button>
          <button onClick={handleExportAuditLogs} className="btn-secondary">
            <FileText size={16} />
            <span>Export Audit Trail</span>
          </button>
          <button onClick={handlePrintCertificate} className="btn-primary">
            <Printer size={16} />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>

      {/* Official Summary Sheet */}
      <div className="print-certificate card-base">
        <div className="cert-header">
          <div className="cert-seal">
            <Award size={36} color="#1e3a8a" />
          </div>
          <div>
            <h3 className="cert-inst-title">{electionConfig.institution}</h3>
            <h4 className="cert-elec-title">{electionConfig.title}</h4>
            <div className="cert-meta">
              Official Election Record • Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Turnout Stats Bar */}
        <div className="cert-stats-strip">
          <div className="cert-stat-item">
            <span className="cs-label">Total Registered Voters</span>
            <span className="cs-val">{totalVoters}</span>
          </div>
          <div className="cert-stat-item">
            <span className="cs-label">Total Ballots Cast</span>
            <span className="cs-val">{votedCount}</span>
          </div>
          <div className="cert-stat-item">
            <span className="cs-label">Voter Turnout Rate</span>
            <span className="cs-val">{turnoutPercent}%</span>
          </div>
          <div className="cert-stat-item">
            <span className="cs-label">Election Status</span>
            <span className="cs-val text-emerald">{electionConfig.status}</span>
          </div>
        </div>

        {/* Leading Candidates Summary */}
        <div className="cert-results-grid">
          {positions.map((pos) => {
            const posCandidates = candidates
              .filter((c) => c.positionId === pos.id)
              .sort((a, b) => (b.votes || 0) - (a.votes || 0));
            const winner = posCandidates[0];

            return (
              <div key={pos.id} className="cert-pos-card">
                <div className="cert-pos-header">
                  <span className="pos-badge">Step #{pos.sequence}</span>
                  <span className="pos-name">{pos.title}</span>
                </div>
                {winner && winner.votes > 0 ? (
                  <div className="cert-winner-row">
                    <div className="winner-symbol">{winner.symbolIcon}</div>
                    <div className="winner-details">
                      <div className="winner-name">{winner.name}</div>
                      <div className="winner-dept">{winner.department} • {winner.rollNo}</div>
                    </div>
                    <div className="winner-tally">
                      <span className="lead-tag">Winner</span>
                      <strong>{winner.votes}</strong> votes
                    </div>
                  </div>
                ) : (
                  <div className="cert-pending-row">
                    <AlertCircle size={16} />
                    <span>No ballots polled yet for this post</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="audit-section-header">
        <div className="audit-title-left">
          <Clock size={18} />
          <h3>System Event Log & Tamper Trail</h3>
          <span className="badge badge-neutral">{filteredLogs.length} Events</span>
        </div>

        <div className="filter-pill-group">
          <button
            onClick={() => setFilterAction("ALL")}
            className={`filter-pill ${filterAction === "ALL" ? "active" : ""}`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterAction("VOTER_AUTHORIZED")}
            className={`filter-pill ${filterAction === "VOTER_AUTHORIZED" ? "active" : ""}`}
          >
            Authorizations
          </button>
          <button
            onClick={() => setFilterAction("BALLOT")}
            className={`filter-pill ${filterAction === "BALLOT" ? "active" : ""}`}
          >
            Ballots
          </button>
          <button
            onClick={() => setFilterAction("POSITION")}
            className={`filter-pill ${filterAction === "POSITION" ? "active" : ""}`}
          >
            Admin Structure
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="audit-feed card-base">
        {filteredLogs.map((log) => {
          const isBallot = log.action.includes("BALLOT");
          const isAuth = log.action.includes("AUTHORIZED");
          const date = new Date(log.timestamp);
          const timeFormatted = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

          return (
            <div key={log.id} className="audit-log-item">
              <div className="audit-time-col">
                <span className="log-time">{timeFormatted}</span>
                <span className="log-date">{date.toLocaleDateString([], { month: "short", day: "numeric" })}</span>
              </div>

              <div className="audit-dot-col">
                <span className={`log-dot ${isBallot ? "dot-emerald" : isAuth ? "dot-blue" : "dot-neutral"}`} />
              </div>

              <div className="audit-body-col">
                <div className="log-action-line">
                  <span className="log-actor">{log.actor}</span>
                  <span className={`badge ${isBallot ? "badge-success" : isAuth ? "badge-blue" : "badge-neutral"}`}>
                    {log.action}
                  </span>
                </div>
                <div className="log-details">{log.details}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
