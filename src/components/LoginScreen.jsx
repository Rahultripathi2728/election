import React, { useState } from "react";
import { 
  Lock, 
  KeyRound, 
  User, 
  ShieldCheck, 
  Vote, 
  BarChart3, 
  Building, 
  AlertCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  X,
  ArrowLeft
} from "lucide-react";
import { useElection } from "../context/ElectionContext";
import { initialStationCredentials } from "../data/initialData";
import gehuLogo from "../assets/gehu_logo.png";
import snaLogo from "../assets/sna_logo.png";

export const LoginScreen = ({ onLoginSuccess, isModal = false, onClose }) => {
  const { electionConfig, firebaseStatus, voters, ballots } = useElection();
  
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeCreds = electionConfig?.stationCredentials || initialStationCredentials;

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage("Please enter both Station ID and Security Password.");
      return;
    }

    // Role Matcher against dynamic configured credentials
    let authenticatedStation = null;

    // 1. Chief Electoral Officer (Admin)
    const adminCred = activeCreds.admin || initialStationCredentials.admin;
    if (
      cleanUser === adminCred.username.toLowerCase() &&
      cleanPass === adminCred.passcode
    ) {
      authenticatedStation = {
        role: "admin",
        username: adminCred.username,
        label: adminCred.label || "Chief Electoral Officer (Admin)"
      };
    }

    // 2. Verification Officer Desk
    const verifyCred = activeCreds.verify || initialStationCredentials.verify;
    if (
      !authenticatedStation &&
      (cleanUser === verifyCred.username.toLowerCase() || cleanUser === "verify" || cleanUser === "officer") &&
      cleanPass === verifyCred.passcode
    ) {
      authenticatedStation = {
        role: "verify",
        username: verifyCred.username,
        label: verifyCred.label || "Verification Officer Desk"
      };
    }

    // 3. EVM Voting Terminal (Supports "booth", "evm", or direct booth IDs "booth1", "booth2", "booth3")
    const evmCred = activeCreds.evm || initialStationCredentials.evm;
    const isBoothMatch = 
      cleanUser === evmCred.username.toLowerCase() || 
      cleanUser === "booth" || 
      cleanUser === "evm" ||
      cleanUser === "booth1" || cleanUser === "booth-1" ||
      cleanUser === "booth2" || cleanUser === "booth-2" ||
      cleanUser === "booth3" || cleanUser === "booth-3";

    if (!authenticatedStation && isBoothMatch && cleanPass === evmCred.passcode) {
      if (cleanUser === "booth1" || cleanUser === "booth-1") {
        try { localStorage.setItem("active_evm_booth_id", "BOOTH-1"); } catch(e) {}
      } else if (cleanUser === "booth2" || cleanUser === "booth-2") {
        try { localStorage.setItem("active_evm_booth_id", "BOOTH-2"); } catch(e) {}
      } else if (cleanUser === "booth3" || cleanUser === "booth-3") {
        try { localStorage.setItem("active_evm_booth_id", "BOOTH-3"); } catch(e) {}
      }

      const assignedBoothLabel = 
        cleanUser.includes("1") ? "EVM Terminal 01 (Booth #1)" :
        cleanUser.includes("2") ? "EVM Terminal 02 (Booth #2)" :
        cleanUser.includes("3") ? "EVM Terminal 03 (Booth #3)" :
        "EVM Voting Terminal";

      authenticatedStation = {
        role: "evm",
        username: evmCred.username,
        label: assignedBoothLabel
      };
    }

    // 4. Public Live Results Display
    const liveCred = activeCreds.live || initialStationCredentials.live;
    if (
      !authenticatedStation &&
      (cleanUser === liveCred.username.toLowerCase() || cleanUser === "live" || cleanUser === "public") &&
      cleanPass === liveCred.passcode
    ) {
      authenticatedStation = {
        role: "live",
        username: liveCred.username,
        label: liveCred.label || "Public Results Display"
      };
    }

    if (authenticatedStation) {
      onLoginSuccess(authenticatedStation);
      if (onClose) onClose();
    } else {
      setErrorMessage("Access Denied: Invalid Station ID or Security Password.");
    }
  };

  const content = (
    <div className="login-container" style={{ maxWidth: "480px", margin: "0 auto", position: "relative" }}>
      {/* Modal Close Button if displayed in Modal */}
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#ffffff",
            border: "1.5px solid var(--border-light)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            zIndex: 10
          }}
          title="Return to Public View"
        >
          <X size={18} />
        </button>
      )}

      {/* Institutional Header with Logos */}
      <div className="login-header text-center" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "10px" }}>
          <img
            src={gehuLogo}
            alt="Graphic Era Hill University"
            style={{ width: "52px", height: "52px", objectFit: "contain", borderRadius: "50%", background: "#fff", padding: "2px", border: "1px solid #e2e8f0" }}
          />
          <img
            src={snaLogo}
            alt="SNA India"
            style={{ width: "52px", height: "52px", objectFit: "contain", borderRadius: "50%", background: "#fff", padding: "2px", border: "1px solid #e2e8f0" }}
          />
        </div>

        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#2563eb", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {electionConfig.institution || "Graphic Era Hill University"} • {electionConfig.department || "College of Nursing"}
        </div>
        <h1 style={{ margin: "4px 0 2px", fontSize: "1.35rem", fontWeight: 800, color: "var(--primary-navy)" }}>
          Official Station Login
        </h1>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Restricted access for Chief Electoral Officer, Verification Desk & EVM Terminals
        </p>
      </div>

      {/* Login Form Card */}
      <div className="login-card card-base" style={{ padding: "24px", borderRadius: "14px", border: "1.5px solid var(--border-light)" }}>
        <div className="login-card-head" style={{ marginBottom: "16px" }}>
          <div className="login-badge-icon">
            <Lock size={20} color="#2563eb" />
          </div>
          <div>
            <h2 className="login-card-title" style={{ fontSize: "1.1rem" }}>Authorized Credentials</h2>
            <p className="login-card-sub" style={{ fontSize: "0.75rem" }}>Enter your station ID & passcode</p>
          </div>
        </div>

        {errorMessage && (
          <div className="alert-box alert-error mb-4" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label htmlFor="station-id-input" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Station ID / Username</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input
                id="station-id-input"
                type="text"
                required
                autoFocus
                placeholder="e.g. admin, officer, booth1, booth2, booth3"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="form-input with-icon"
                autoComplete="username"
                style={{ fontSize: "0.9rem" }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "18px" }}>
            <label htmlFor="station-password-input" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Security Password</label>
            <div className="input-with-icon" style={{ position: "relative" }}>
              <KeyRound size={18} className="field-icon" />
              <input
                id="station-password-input"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter passcode..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="form-input with-icon"
                autoComplete="current-password"
                style={{ paddingRight: "42px", fontSize: "0.9rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px"
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-block btn-lg" style={{ fontSize: "0.95rem", fontWeight: 800 }}>
            <span>Sign In to Station</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {isModal && onClose && (
          <div style={{ textAlign: "center", marginTop: "14px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <ArrowLeft size={14} />
              <span>Cancel & Return to Public View</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px"
      }}>
        {content}
      </div>
    );
  }

  return (
    <div className="login-page-wrapper fade-in">
      <div className="login-bg-shape shape-1"></div>
      <div className="login-bg-shape shape-2"></div>
      {content}
    </div>
  );
};
