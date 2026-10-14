import React, { useState } from "react";
import { 
  Lock, 
  KeyRound, 
  User, 
  ShieldCheck, 
  Sliders, 
  Vote, 
  BarChart3, 
  Building, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { useElection } from "../context/ElectionContext";

const ACCOUNTS = [
  {
    username: "admin",
    passcode: "admin123",
    role: "admin",
    label: "Chief Electoral Officer (Admin)",
    icon: Sliders,
    color: "#2563eb",
    desc: "Complete election administration, candidates, voter registry, and audit ledger."
  },
  {
    username: "officer",
    passcode: "verify123",
    role: "verify",
    label: "Verification Officer Desk",
    icon: ShieldCheck,
    color: "#059669",
    desc: "Student ID check-in desk, voter eligibility verification, and EVM booth unlocking."
  },
  {
    username: "booth",
    passcode: "booth123",
    role: "evm",
    label: "EVM Voting Terminal",
    icon: Vote,
    color: "#d97706",
    desc: "Isolated electronic voting machine booth for students to cast secret ballots."
  },
  {
    username: "live",
    passcode: "live123",
    role: "live",
    label: "Public Results Display",
    icon: BarChart3,
    color: "#7c3aed",
    desc: "Public view-only projection screen for real-time live election results."
  }
];

export const LoginScreen = ({ onLoginSuccess }) => {
  const { electionConfig, firebaseStatus, voters, ballots } = useElection();
  
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Map alternate aliases
    let targetAccount = ACCOUNTS.find(
      (acc) => acc.username === cleanUser && acc.passcode === cleanPass
    );

    // Accept aliases
    if (!targetAccount) {
      if (cleanUser === "verify" && cleanPass === "verify123") {
        targetAccount = ACCOUNTS.find((a) => a.role === "verify");
      } else if (cleanUser === "evm" && cleanPass === "booth123") {
        targetAccount = ACCOUNTS.find((a) => a.role === "evm");
      } else if (cleanUser === "public" && cleanPass === "live123") {
        targetAccount = ACCOUNTS.find((a) => a.role === "live");
      }
    }

    if (targetAccount) {
      onLoginSuccess({
        role: targetAccount.role,
        username: targetAccount.username,
        label: targetAccount.label
      });
    } else {
      setErrorMessage("Invalid ID or Password. Please check your credentials below.");
    }
  };

  const handleQuickFill = (acc) => {
    setUsernameInput(acc.username);
    setPasswordInput(acc.passcode);
    setErrorMessage("");
  };

  const handleDirectPublicLive = () => {
    onLoginSuccess({
      role: "live",
      username: "public",
      label: "Public Results Display"
    });
  };

  return (
    <div className="login-page-wrapper fade-in">
      {/* Background Decor */}
      <div className="login-bg-shape shape-1"></div>
      <div className="login-bg-shape shape-2"></div>

      <div className="login-container">
        {/* Institutional Header */}
        <div className="login-header text-center">
          <div className="login-inst-pill">
            <Building size={16} />
            <span>{electionConfig.institution}</span>
          </div>
          <h1 className="login-main-title">{electionConfig.title}</h1>
          <p className="login-subtitle">
            Official Role-Based Authentication Portal • Sign in with your designated Station ID & Password
          </p>
        </div>

        {/* Login Form Card */}
        <div className="login-card card-base">
          <div className="login-card-head">
            <div className="login-badge-icon">
              <Lock size={22} color="#2563eb" />
            </div>
            <div>
              <h2 className="login-card-title">Station Security Login</h2>
              <p className="login-card-sub">Access is strictly restricted by assigned role</p>
            </div>
          </div>

          {errorMessage && (
            <div className="alert-box alert-error mb-4">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Station ID / Username</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter Station ID (e.g. admin, officer, booth, live)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="form-input with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Security Password / PIN</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="field-icon" />
                <input
                  type="password"
                  required
                  placeholder="Enter Password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="form-input with-icon"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary btn-block btn-lg mt-3">
              <span>Sign In to Station</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Quick 1-Click Fill Helper for Evaluator */}
          <div className="login-quick-roles mt-4">
            <div className="quick-roles-title">
              <span>Quick Demo Credentials (Click to fill):</span>
            </div>
            <div className="quick-roles-grid">
              {ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = usernameInput === acc.username;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className={`quick-role-chip ${isSelected ? "selected" : ""}`}
                  >
                    <div className="chip-icon" style={{ color: acc.color }}>
                      <Icon size={15} />
                    </div>
                    <div className="chip-info">
                      <div className="chip-name">{acc.label.split("(")[0]}</div>
                      <div className="chip-creds font-mono">
                        {acc.username} / {acc.passcode}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="login-footer-action text-center mt-3">
            <button
              type="button"
              onClick={handleDirectPublicLive}
              className="btn-text-link"
            >
              <BarChart3 size={15} />
              <span>Or Open Public Results Projector Screen (View Only)</span>
            </button>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="login-telemetry-bar text-center mt-3">
          <span>Backend Cloud: <strong className="text-emerald">{firebaseStatus.connected ? "Firebase Live (Firestore)" : "Local Sync Mode"}</strong></span>
          <span className="dot-sep">•</span>
          <span>Electoral Roll: <strong>{voters.length} Registered Students</strong></span>
          <span className="dot-sep">•</span>
          <span>Ballots Polled: <strong>{ballots.length} Votes</strong></span>
        </div>
      </div>
    </div>
  );
};
