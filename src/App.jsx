import React, { useState, useEffect, useRef } from "react";
import { ElectionProvider } from "./context/ElectionContext";
import { Navbar } from "./components/Navbar";
import { LoginScreen } from "./components/LoginScreen";
import { AdminPanel } from "./components/AdminPanel";
import { VerificationPanel } from "./components/VerificationPanel";
import { EVMPanel } from "./components/EVMPanel";
import { LiveResultsPanel } from "./components/LiveResultsPanel";
import { FirebaseModal } from "./components/FirebaseModal";
import "./App.css";

const SESSION_STORAGE_KEY = "paperless_election_user_session_v3";

const MainApp = () => {
  // Session State: { role: "admin" | "verify" | "evm" | "live", username: string, label: string }
  const [userSession, setUserSession] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const requestedRole = params.get("role") || params.get("view") || params.get("station");
      if (["admin", "verify", "evm", "live"].includes(requestedRole)) {
        return {
          role: requestedRole,
          username: requestedRole,
          label: requestedRole.toUpperCase()
        };
      }
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && ["admin", "verify", "evm", "live"].includes(parsed.role)) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  // Global Fullscreen Manager: Works across ALL dashboards via [F] and long-press [ESC]
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [escHolding, setEscHolding] = useState(false);
  const escTimerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : "";
      const isInput = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";

      // Toggle Fullscreen with [F] key across all dashboards
      if ((e.key === "f" || e.key === "F") && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        }
      }

      // Long-Press [Escape] to exit fullscreen
      if (e.key === "Escape" && document.fullscreenElement) {
        if (!escTimerRef.current) {
          setEscHolding(true);
          escTimerRef.current = setTimeout(() => {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
            setEscHolding(false);
            escTimerRef.current = null;
          }, 800); // 800ms hold requirement
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Escape") {
        if (escTimerRef.current) {
          clearTimeout(escTimerRef.current);
          escTimerRef.current = null;
        }
        setEscHolding(false);
      }
    };

    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("fullscreenchange", handleFsChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("fullscreenchange", handleFsChange);
      if (escTimerRef.current) clearTimeout(escTimerRef.current);
    };
  }, []);

  // Sync role to URL for multi-window simulation
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (userSession?.role) {
        url.searchParams.set("role", userSession.role);
        window.history.replaceState({}, "", url.toString());
      }
    } catch (e) {}
  }, [userSession]);

  const handleLoginSuccess = (sessionData) => {
    setUserSession(sessionData);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {}
  };

  const handleLogout = () => {
    setUserSession(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      const url = new URL(window.location.href);
      url.searchParams.delete("role");
      url.searchParams.delete("view");
      url.searchParams.delete("station");
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  };

  // If not authenticated, render LoginScreen
  if (!userSession) {
    return (
      <div className="app-root">
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <FirebaseModal
          isOpen={showFirebaseModal}
          onClose={() => setShowFirebaseModal(false)}
        />
      </div>
    );
  }

  // Render ONLY the authenticated role's dashboard
  return (
    <div className="app-root">
      <Navbar
        userSession={userSession}
        onLogout={handleLogout}
        onOpenFirebaseModal={() => setShowFirebaseModal(true)}
      />

      <main className="main-content">
        {userSession.role === "admin" && (
          <AdminPanel onOpenFirebaseModal={() => setShowFirebaseModal(true)} />
        )}
        {userSession.role === "verify" && <VerificationPanel />}
        {userSession.role === "evm" && <EVMPanel />}
        {userSession.role === "live" && <LiveResultsPanel />}
      </main>

      <FirebaseModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />

      {/* Global Esc Long-Press Progress HUD */}
      {escHolding && (
        <div className="esc-hold-hud fade-in">
          <div className="esc-hold-pill">
            <span className="esc-key-badge">ESC</span>
            <div className="esc-bar-track">
              <div className="esc-bar-fill animate-esc-fill" />
            </div>
            <span className="esc-text">Holding to Exit Fullscreen...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ElectionProvider>
      <MainApp />
    </ElectionProvider>
  );
}
