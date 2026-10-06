import React, { useState } from "react";
import { 
  Layers, 
  Users, 
  UserCheck, 
  FileCheck2, 
  Settings, 
  TrendingUp, 
  Award,
  Vote
} from "lucide-react";
import { PositionsTab } from "./PositionsTab";
import { CandidatesTab } from "./CandidatesTab";
import { VotersTab } from "./VotersTab";
import { AuditTab } from "./AuditTab";
import { SettingsTab } from "./SettingsTab";
import { useElection } from "../../context/ElectionContext";

export const AdminPanel = ({ onOpenFirebaseModal }) => {
  const [activeSubTab, setActiveSubTab] = useState("positions");
  const { positions, candidates, voters, electionConfig } = useElection();

  const totalVoters = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;

  return (
    <div className="admin-page-layout fade-in">
      {/* Subtab Navigation Bar */}
      <div className="admin-subnav-bar">
        <div className="admin-tabs-list">
          <button
            onClick={() => setActiveSubTab("positions")}
            className={`admin-tab-item ${activeSubTab === "positions" ? "active" : ""}`}
          >
            <Layers size={18} />
            <span>Electoral Posts & Sequence</span>
            <span className="badge badge-neutral">{positions.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("candidates")}
            className={`admin-tab-item ${activeSubTab === "candidates" ? "active" : ""}`}
          >
            <Users size={18} />
            <span>Nominated Candidates</span>
            <span className="badge badge-neutral">{candidates.length}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("voters")}
            className={`admin-tab-item ${activeSubTab === "voters" ? "active" : ""}`}
          >
            <UserCheck size={18} />
            <span>Electoral Roll (Voters)</span>
            <span className="badge badge-neutral">{totalVoters}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("audit")}
            className={`admin-tab-item ${activeSubTab === "audit" ? "active" : ""}`}
          >
            <FileCheck2 size={18} />
            <span>Audit Trail & Reports</span>
          </button>

          <button
            onClick={() => setActiveSubTab("settings")}
            className={`admin-tab-item ${activeSubTab === "settings" ? "active" : ""}`}
          >
            <Settings size={18} />
            <span>Election Settings</span>
          </button>
        </div>
      </div>

      {/* Main Subtab View */}
      <div className="admin-subtab-content">
        {activeSubTab === "positions" && <PositionsTab />}
        {activeSubTab === "candidates" && <CandidatesTab />}
        {activeSubTab === "voters" && <VotersTab />}
        {activeSubTab === "audit" && <AuditTab />}
        {activeSubTab === "settings" && <SettingsTab onOpenFirebaseModal={onOpenFirebaseModal} />}
      </div>
    </div>
  );
};
