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

const SESSION_STORAGE_KEY = "paperless_election_session_secure_v4";

const MainApp = () => {
  // Session State: { role: "admin" | "verify" | "evm" | "live", username: string, label: string }
  // Production Hardening: URL parameter bypass is completely stripped. Real password entry required.
  const [userSession, setUserSession] = useState(() => {
    try {
      // 1. Production Security: Strip out any unauthorized query param attempt (?role=...)
      const url = new URL(window.location.href);
      let cleaned = false;
      ["role", "view", "station"].forEach((p) => {
        if (url.searchParams.has(p)) {
          url.searchParams.delete(p);
          cleaned = true;
        }
      });
      if (cleaned) {
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }

      // 2. Invalidate legacy unauthenticated sessions
      localStorage.removeItem("paperless_election_user_session_v3");

      // 3. Strictly restore only from active sessionStorage (closing browser/tab requires fresh login)
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
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
  const [showLoginModal, setShowLoginModal] = useState(() => {
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get("login") === "true";
    } catch (e) {
      return false;
    }
  });
  const [viewingPublicView, setViewingPublicView] = useState(false);

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

  const handleLoginSuccess = (sessionData) => {
    setUserSession(sessionData);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {}
  };

  const handleLogout = () => {
    setUserSession(null);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem("paperless_election_user_session_v3");
      const url = new URL(window.location.href);
      url.searchParams.delete("role");
      url.searchParams.delete("view");
      url.searchParams.delete("station");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    } catch (e) {}
  };

  // Public Home Portal is the default zero-login screen for students & public!
  if (!userSession) {
    return (
      <div className="app-root">
        <LiveResultsPanel onOpenLogin={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <LoginScreen
            isModal={true}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    );
  }

  // Render authenticated role's dashboard (with option to preview public view)
  return (
    <div className="app-root">
      <Navbar
        userSession={userSession}
        onLogout={handleLogout}
        onOpenFirebaseModal={() => setShowFirebaseModal(true)}
        isViewingPublic={viewingPublicView}
        onTogglePublicView={() => setViewingPublicView(!viewingPublicView)}
      />

      <main className="main-content">
        {viewingPublicView ? (
          <LiveResultsPanel
            isStaffPreview={true}
            onReturnToStation={() => setViewingPublicView(false)}
          />
        ) : (
          <>
            {userSession.role === "admin" && (
              <AdminPanel onOpenFirebaseModal={() => setShowFirebaseModal(true)} />
            )}
            {userSession.role === "verify" && <VerificationPanel />}
            {userSession.role === "evm" && <EVMPanel userSession={userSession} />}
            {userSession.role === "live" && <LiveResultsPanel />}
          </>
        )}
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
