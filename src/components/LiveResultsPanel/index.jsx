import React, { useState } from "react";
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  Users, 
  Vote, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Printer, 
  Sparkles,
  Layers
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";

export const LiveResultsPanel = () => {
  const { electionConfig, positions, candidates, voters } = useElection();
  const [selectedPostFilter, setSelectedPostFilter] = useState("ALL");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const turnoutPercent = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;

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
    <div className={`live-results-container fade-in ${isFullscreen ? "fullscreen-mode" : ""}`}>
      {/* Live Dashboard Header */}
      <div className="live-header-card card-base">
        <div className="live-header-left">
          <div className="live-telemetry-badge">
            <Radio size={14} className="radio-pulse text-danger" />
            <span className="live-text">LIVE REAL-TIME TELEMETRY</span>
          </div>
          <h1 className="live-main-title">{electionConfig.title}</h1>
          <p className="live-inst-name">{electionConfig.institution} • Official Results Projector</p>
        </div>

        {/* Global Turnout Metrics & Actions */}
        <div className="live-header-right">
          <div className="turnout-stats-strip">
            <div className="t-stat-card">
              <span className="t-stat-num">{votedCount}</span>
              <span className="t-stat-title">Ballots Polled</span>
            </div>
            <div className="t-stat-card">
              <span className="t-stat-num">{totalVoters}</span>
              <span className="t-stat-title">Total Roster</span>
            </div>
            <div className="t-stat-card highlight-card">
              <span className="t-stat-num text-emerald">{turnoutPercent}%</span>
              <span className="t-stat-title">Voter Turnout</span>
            </div>
          </div>

          <div className="live-header-btn-row">
            <button
              onClick={toggleFullscreen}
              className="btn-secondary btn-icon-only"
              title={isFullscreen ? "Exit Fullscreen" : "Projector Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={() => window.print()}
              className="btn-secondary btn-icon-only"
              title="Print Current Standings"
            >
              <Printer size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Position Filter Pills */}
      <div className="live-filter-strip">
        <span className="live-filter-label">View Position:</span>
        <button
          onClick={() => setSelectedPostFilter("ALL")}
          className={`filter-pill ${selectedPostFilter === "ALL" ? "active" : ""}`}
        >
          All Positions ({positions.length})
        </button>
        {positions.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPostFilter(p.id)}
            className={`filter-pill ${selectedPostFilter === p.id ? "active" : ""}`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Grid of Positions and Live Candidate Vote Tallies */}
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
                    Currently Leading: <strong>{leader.name}</strong> ({leader.symbolName})
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
                          src={cand.avatarUrl}
                          alt={cand.name}
                          className="live-avatar-img"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80";
                          }}
                        />
                        <span className="live-symbol-badge" title={`Symbol: ${cand.symbolName}`}>
                          {cand.symbolIcon}
                        </span>
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
  );
};
