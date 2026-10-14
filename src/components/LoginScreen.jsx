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
  EyeOff
} from "lucide-react";
import { useElection } from "../context/ElectionContext";
import { initialStationCredentials } from "../data/initialData";

export const LoginScreen = ({ onLoginSuccess }) => {
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
    } else {
      setErrorMessage("Access Denied: Invalid Station ID or Security Password.");
    }
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
            Official Election Security Portal • Authorized Station Personnel Only
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
              <p className="login-card-sub">Password authentication required for all official terminals</p>
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
              <label htmlFor="station-id-input">Station ID / Username</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  id="station-id-input"
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter designated Station ID"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="form-input with-icon"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="station-password-input">Security Password</label>
              <div className="input-with-icon" style={{ position: "relative" }}>
                <KeyRound size={18} className="field-icon" />
                <input
                  id="station-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter Station Password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="form-input with-icon"
                  autoComplete="current-password"
                  style={{ paddingRight: "42px" }}
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

            <button type="submit" className="btn-primary btn-block btn-lg mt-3">
              <span>Sign In to Station</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="login-footer-action text-center mt-3">
            <button
              type="button"
              onClick={handleDirectPublicLive}
              className="btn-text-link"
            >
              <BarChart3 size={15} />
              <span>Open Public Results Screen (Read-Only Telemetry)</span>
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
