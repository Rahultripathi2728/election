import React, { useState } from "react";
import { 
  Layers, 
  Users, 
  UserCheck, 
  FileCheck2, 
  Settings, 
  Vote,
  FileSpreadsheet
} from "lucide-react";
import { PositionsTab } from "./PositionsTab";
import { CandidatesTab } from "./CandidatesTab";
import { VotersTab } from "./VotersTab";
import { VoteAuditTab } from "./VoteAuditTab";
import { AuditTab } from "./AuditTab";
import { SettingsTab } from "./SettingsTab";
import { useElection } from "../../context/ElectionContext";

export const AdminPanel = ({ onOpenFirebaseModal }) => {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subtab") || params.get("tab");
      if (["positions", "candidates", "voters", "voteAudit", "audit", "settings"].includes(sub)) {
        return sub;
      }
    } catch (e) {}
    return "positions";
  });

  const { positions, candidates, voters, ballots, electionConfig } = useElection();
  const totalVoters = voters.length;

  const handleTabChange = (tabId) => {
    setActiveSubTab(tabId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("subtab", tabId);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  };

  return (
    <div className="admin-page-layout fade-in">
      {/* Subtab Navigation Bar */}
      <div className="admin-subnav-bar">
        <div className="admin-tabs-list">
          <button
            id="admin-tab-positions"
            type="button"
            onClick={() => handleTabChange("positions")}
            className={`admin-tab-item ${activeSubTab === "positions" ? "active" : ""}`}
          >
            <Layers size={18} />
            <span>Electoral Posts</span>
            <span className="badge badge-neutral">{positions.length}</span>
          </button>

          <button
            id="admin-tab-candidates"
            type="button"
            onClick={() => handleTabChange("candidates")}
            className={`admin-tab-item ${activeSubTab === "candidates" ? "active" : ""}`}
          >
            <Users size={18} />
            <span>Nominated Candidates</span>
            <span className="badge badge-neutral">{candidates.length}</span>
          </button>

          <button
            id="admin-tab-voters"
            type="button"
            onClick={() => handleTabChange("voters")}
            className={`admin-tab-item ${activeSubTab === "voters" ? "active" : ""}`}
          >
            <UserCheck size={18} />
            <span>Electoral Roll (Voters)</span>
            <span className="badge badge-neutral">{totalVoters}</span>
          </button>

          <button
            id="admin-tab-voteAudit"
            type="button"
            onClick={() => handleTabChange("voteAudit")}
            className={`admin-tab-item ${activeSubTab === "voteAudit" ? "active" : ""}`}
          >
            <Vote size={18} />
            <span>Vote Transparency Audit</span>
            <span className="badge badge-success">{ballots.length} Votes</span>
          </button>

          <button
            id="admin-tab-audit"
            type="button"
            onClick={() => handleTabChange("audit")}
            className={`admin-tab-item ${activeSubTab === "audit" ? "active" : ""}`}
          >
            <FileCheck2 size={18} />
            <span>System Logs & Certificate</span>
          </button>

          <button
            id="admin-tab-settings"
            type="button"
            onClick={() => handleTabChange("settings")}
            className={`admin-tab-item ${activeSubTab === "settings" ? "active" : ""}`}
          >
            <Settings size={18} />
            <span>Settings & Cloud</span>
          </button>
        </div>
      </div>

      {/* Main Subtab View */}
      <div className="admin-subtab-content">
        {activeSubTab === "positions" && <PositionsTab />}
        {activeSubTab === "candidates" && <CandidatesTab />}
        {activeSubTab === "voters" && <VotersTab />}
        {activeSubTab === "voteAudit" && <VoteAuditTab />}
        {activeSubTab === "audit" && <AuditTab />}
        {activeSubTab === "settings" && <SettingsTab onOpenFirebaseModal={onOpenFirebaseModal} />}
      </div>
    </div>
  );
};
