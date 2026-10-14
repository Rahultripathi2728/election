import React, { useState } from "react";
import { 
  X, 
  Cloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  KeyRound, 
  ShieldCheck, 
  Info 
} from "lucide-react";
import { useElection } from "../context/ElectionContext";
import { getSavedFirebaseConfig } from "../services/firebase";
import { Modal } from "./common/Modal";

export const FirebaseModal = ({ isOpen, onClose }) => {
  const { firebaseStatus, configureFirebase } = useElection();
  const [config, setConfig] = useState(() => getSavedFirebaseConfig());
  const [statusMessage, setStatusMessage] = useState(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setTesting(true);
    setStatusMessage({ type: "info", text: "Connecting to Firebase..." });

    try {
      const result = configureFirebase(config);
      setTesting(false);
      if (result.connected) {
        setStatusMessage({ type: "success", text: result.message });
      } else {
        setStatusMessage({ type: "warning", text: result.message });
      }
    } catch (err) {
      setTesting(false);
      setStatusMessage({ type: "error", text: `Connection error: ${err.message}` });
    }
  };

  const handleFillDemoKeys = () => {
    setConfig({
      apiKey: "AIzaSyBLHp185MB1hqBWyakKrgWgRVEzJAUgHYg",
      authDomain: "election-live-8921a.firebaseapp.com",
      projectId: "election-live-8921a",
      storageBucket: "election-live-8921a.firebasestorage.app",
      messagingSenderId: "171253767960",
      appId: "1:171253767960:web:3f7b0c179aaaaa2e16486d"
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className="firebase-modal-card">
      <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Cloud size={22} color="#2563eb" />
            </div>
            <div>
              <h3>Firebase Cloud Synchronization</h3>
              <p>Configure Firebase Firestore & Realtime Database for live cross-station synchronization</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Current Connection Status Box */}
        <div className={`status-callout ${firebaseStatus.connected ? "callout-success" : "callout-neutral"}`}>
          <div className="callout-icon">
            {firebaseStatus.connected ? (
              <CheckCircle2 size={20} color="#059669" />
            ) : (
              <ShieldCheck size={20} color="#2563eb" />
            )}
          </div>
          <div>
            <div className="callout-title">
              {firebaseStatus.connected ? "Active Firebase Cloud Connection" : "Local Real-Time Sync Engine Active"}
            </div>
            <div className="callout-text">{firebaseStatus.message}</div>
          </div>
        </div>

        {/* Dual-Mode Architecture Info Note */}
        <div className="info-box">
          <Info size={18} className="info-icon" />
          <p>
            <strong>Zero-Config Resilient Sync:</strong> Even without an active Firebase project ID, all booths, 
            verification stations, and live projection screens automatically synchronize instantaneously across browser 
            windows and devices on the local network using high-speed broadcast channels!
          </p>
        </div>

        {/* Status Message feedback if saved */}
        {statusMessage && (
          <div className={`alert-box alert-${statusMessage.type}`}>
            {statusMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="firebase-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Firebase API Key</label>
              <input
                type="text"
                name="apiKey"
                value={config.apiKey || ""}
                onChange={handleChange}
                placeholder="AIzaSy..."
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Project ID</label>
              <input
                type="text"
                name="projectId"
                value={config.projectId || ""}
                onChange={handleChange}
                placeholder="e.g. campus-election-2026"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Auth Domain</label>
              <input
                type="text"
                name="authDomain"
                value={config.authDomain || ""}
                onChange={handleChange}
                placeholder="e.g. campus-election.firebaseapp.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Storage Bucket</label>
              <input
                type="text"
                name="storageBucket"
                value={config.storageBucket || ""}
                onChange={handleChange}
                placeholder="e.g. campus-election.appspot.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>App ID</label>
              <input
                type="text"
                name="appId"
                value={config.appId || ""}
                onChange={handleChange}
                placeholder="1:123456789:web:abcdef..."
                className="form-input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleFillDemoKeys}
              className="btn-text-action"
            >
              Fill Sample Keys
            </button>
            <div className="footer-right-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={testing} className="btn-primary">
                {testing ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Save & Connect Firebase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
    </Modal>
  );
};
