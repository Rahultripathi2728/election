import React, { useState, useEffect } from "react";
import { ElectionProvider, useElection } from "./context/ElectionContext";
import { Navbar } from "./components/Navbar";
import { AdminPanel } from "./components/AdminPanel";
import { VerificationPanel } from "./components/VerificationPanel";
import { EVMPanel } from "./components/EVMPanel";
import { LiveResultsPanel } from "./components/LiveResultsPanel";
import { FirebaseModal } from "./components/FirebaseModal";
import "./App.css";

const MainApp = () => {
  // Check URL param ?view=admin | verify | evm | live
  const [activeView, setActiveView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("view");
      if (["admin", "verify", "evm", "live"].includes(requested)) {
        return requested;
      }
    } catch (e) {
      // fallback
    }
    return "admin";
  });

  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  // Sync view param to URL without reload
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("view", activeView);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  }, [activeView]);

  return (
    <div className="app-root">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenFirebaseModal={() => setShowFirebaseModal(true)}
      />

      <main className="main-content">
        {activeView === "admin" && (
          <AdminPanel onOpenFirebaseModal={() => setShowFirebaseModal(true)} />
        )}
        {activeView === "verify" && <VerificationPanel />}
        {activeView === "evm" && <EVMPanel />}
        {activeView === "live" && <LiveResultsPanel />}
      </main>

      <FirebaseModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />
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
