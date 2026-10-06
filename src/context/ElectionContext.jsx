import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  initialElectionConfig, 
  initialPositions, 
  initialCandidates, 
  initialVoters, 
  initialAuditLogs 
} from "../data/initialData";
import { soundManager } from "../utils/sound";
import { 
  initFirebase, 
  getSavedFirebaseConfig, 
  saveFirebaseConfig,
  getDb 
} from "../services/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const STORAGE_KEY = "paperless_election_master_state_v1";
const SYNC_CHANNEL_NAME = "paperless_election_broadcast_v1";

const ElectionContext = createContext(null);

export const ElectionProvider = ({ children }) => {
  // Master Election State
  const [electionConfig, setElectionConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.electionConfig) return parsed.electionConfig;
      }
    } catch (e) {
      console.error(e);
    }
    return initialElectionConfig;
  });

  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.positions) return parsed.positions;
      }
    } catch (e) {
      console.error(e);
    }
    return initialPositions;
  });

  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.candidates) return parsed.candidates;
      }
    } catch (e) {
      console.error(e);
    }
    return initialCandidates;
  });

  const [voters, setVoters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.voters) return parsed.voters;
      }
    } catch (e) {
      console.error(e);
    }
    return initialVoters;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.auditLogs) return parsed.auditLogs;
      }
    } catch (e) {
      console.error(e);
    }
    return initialAuditLogs;
  });

  const [firebaseStatus, setFirebaseStatus] = useState({
    connected: false,
    message: "Initializing real-time sync..."
  });

  const broadcastChannelRef = useRef(null);
  const isInternalUpdateRef = useRef(false);

  // Initialize Firebase and BroadcastChannel
  useEffect(() => {
    const fbResult = initFirebase();
    setFirebaseStatus(fbResult);

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === "STATE_SYNC") {
          isInternalUpdateRef.current = true;
          if (payload.electionConfig) setElectionConfig(payload.electionConfig);
          if (payload.positions) setPositions(payload.positions);
          if (payload.candidates) setCandidates(payload.candidates);
          if (payload.voters) setVoters(payload.voters);
          if (payload.auditLogs) setAuditLogs(payload.auditLogs);
          setTimeout(() => {
            isInternalUpdateRef.current = false;
          }, 50);
        } else if (type === "PLAY_SOUND") {
          if (payload === "SELECT") soundManager.playSelectBeep();
          if (payload === "CONFIRM") soundManager.playVoteConfirmationBeep();
          if (payload === "AUTHORIZE") soundManager.playAuthorizeChime();
          if (payload === "ERROR") soundManager.playErrorBuzzer();
        }
      };
    }

    // Storage event for fallback cross-tab sync
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          isInternalUpdateRef.current = true;
          if (parsed.electionConfig) setElectionConfig(parsed.electionConfig);
          if (parsed.positions) setPositions(parsed.positions);
          if (parsed.candidates) setCandidates(parsed.candidates);
          if (parsed.voters) setVoters(parsed.voters);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
          setTimeout(() => {
            isInternalUpdateRef.current = false;
          }, 50);
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    // Optional Firestore live listener if DB is active
    let unsubscribeFirestore = null;
    const db = getDb();
    if (db) {
      try {
        const electionDocRef = doc(db, "elections", "live_council_state");
        unsubscribeFirestore = onSnapshot(electionDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            isInternalUpdateRef.current = true;
            if (data.electionConfig) setElectionConfig(data.electionConfig);
            if (data.positions) setPositions(data.positions);
            if (data.candidates) setCandidates(data.candidates);
            if (data.voters) setVoters(data.voters);
            if (data.auditLogs) setAuditLogs(data.auditLogs);
            setTimeout(() => {
              isInternalUpdateRef.current = false;
            }, 50);
          }
        });
      } catch (err) {
        console.warn("Firestore listener note:", err);
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Save to LocalStorage and broadcast changes
  useEffect(() => {
    if (isInternalUpdateRef.current) return;

    const fullState = {
      electionConfig,
      positions,
      candidates,
      voters,
      auditLogs
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "STATE_SYNC",
        payload: fullState
      });
    }

    // Push to Firestore if configured
    const db = getDb();
    if (db) {
      try {
        const electionDocRef = doc(db, "elections", "live_council_state");
        setDoc(electionDocRef, fullState, { merge: true }).catch((err) => {
          console.warn("Firestore sync write note:", err.message);
        });
      } catch (e) {
        console.warn("Firestore push notice:", e);
      }
    }
  }, [electionConfig, positions, candidates, voters, auditLogs]);

  // Helper to append audit logs
  const appendLog = (action, actor, details) => {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // --- ACTIONS ---

  // 1. Voter Verification & Authorization (Verification Officer Desk)
  const verifyStudent = (studentId) => {
    if (!studentId) return null;
    const cleanId = studentId.trim().toUpperCase();
    const voter = voters.find((v) => v.studentId.toUpperCase() === cleanId);
    if (!voter) {
      return { status: "NOT_FOUND", voter: null };
    }
    if (voter.hasVoted) {
      return { status: "ALREADY_VOTED", voter };
    }
    // Check if this voter is currently in the booth
    if (
      electionConfig.boothState.status === "UNLOCKED" && 
      electionConfig.boothState.authorizedVoter?.studentId.toUpperCase() === cleanId
    ) {
      return { status: "IN_BOOTH", voter };
    }
    return { status: "ELIGIBLE", voter };
  };

  const authorizeVoterForBooth = (studentId, boothId = "BOOTH-ALPHA-01") => {
    const cleanId = studentId.trim().toUpperCase();
    const voter = voters.find((v) => v.studentId.toUpperCase() === cleanId);

    if (!voter) {
      soundManager.playErrorBuzzer();
      return { success: false, message: "Student record not found." };
    }

    if (voter.hasVoted) {
      soundManager.playErrorBuzzer();
      return { success: false, message: `Student ${voter.name} has already cast their ballot!` };
    }

    const now = new Date().toISOString();

    // Mark voter as authorized
    setVoters((prev) =>
      prev.map((v) =>
        v.studentId.toUpperCase() === cleanId
          ? { ...v, authorizedAt: now }
          : v
      )
    );

    // Unlock EVM Terminal with voter profile
    const newBoothState = {
      status: "UNLOCKED",
      authorizedVoter: {
        studentId: voter.studentId,
        name: voter.name,
        fatherName: voter.fatherName,
        course: voter.course,
        semester: voter.semester,
        photoUrl: voter.photoUrl
      },
      authorizedAt: now,
      activeBoothId: boothId
    };

    setElectionConfig((prev) => ({
      ...prev,
      boothState: newBoothState
    }));

    soundManager.playAuthorizeChime();
    appendLog(
      "VOTER_AUTHORIZED",
      `Verification Desk (${boothId})`,
      `Authorized ${voter.name} (${voter.studentId}) for EVM Terminal`
    );

    return { success: true, message: `Voter ${voter.name} successfully authorized for EVM booth!` };
  };

  const cancelBoothAuthorization = () => {
    const currentVoter = electionConfig.boothState.authorizedVoter;
    setElectionConfig((prev) => ({
      ...prev,
      boothState: {
        status: "LOCKED",
        authorizedVoter: null,
        authorizedAt: null,
        activeBoothId: "BOOTH-ALPHA-01"
      }
    }));

    soundManager.playSelectBeep();
    if (currentVoter) {
      appendLog(
        "AUTHORIZATION_REVOKED",
        "Polling Officer",
        `Authorization revoked for ${currentVoter.name} (${currentVoter.studentId})`
      );
    }
  };

  // 2. Cast Ballot from EVM Terminal
  const castBallot = (selections) => {
    // selections is { [positionId]: candidateId | 'NOTA' }
    const currentVoter = electionConfig.boothState.authorizedVoter;
    if (!currentVoter) {
      soundManager.playErrorBuzzer();
      return { success: false, message: "No authorized voter at terminal." };
    }

    const voterId = currentVoter.studentId;
    const now = new Date().toISOString();

    // 1. Increment candidate vote counts
    setCandidates((prev) =>
      prev.map((cand) => {
        const votedForThis = selections[cand.positionId] === cand.id;
        if (votedForThis) {
          return { ...cand, votes: (cand.votes || 0) + 1 };
        }
        return cand;
      })
    );

    // 2. Mark voter as permanently voted
    setVoters((prev) =>
      prev.map((v) =>
        v.studentId.toUpperCase() === voterId.toUpperCase()
          ? { ...v, hasVoted: true, votedAt: now }
          : v
      )
    );

    // 3. Play iconic long EVM confirmation tone!
    soundManager.playVoteConfirmationBeep();

    // 4. Update booth state to SUBMITTING, then lock after autoLockDelaySeconds
    setElectionConfig((prev) => ({
      ...prev,
      boothState: {
        ...prev.boothState,
        status: "SUBMITTING"
      }
    }));

    appendLog(
      "BALLOT_CAST",
      `EVM Booth (${electionConfig.boothState.activeBoothId})`,
      `Official ballot recorded securely. Voter status locked.`
    );

    setTimeout(() => {
      setElectionConfig((prev) => ({
        ...prev,
        boothState: {
          status: "LOCKED",
          authorizedVoter: null,
          authorizedAt: null,
          activeBoothId: "BOOTH-ALPHA-01"
        }
      }));
    }, (electionConfig.autoLockDelaySeconds || 4) * 1000);

    return { success: true };
  };

  // 3. Admin Positions Management (with Sequence / Ranking)
  const addPosition = (newPos) => {
    const nextSeq = positions.length > 0 ? Math.max(...positions.map((p) => p.sequence)) + 1 : 1;
    const pos = {
      id: `pos_${Date.now()}`,
      sequence: nextSeq,
      status: "ACTIVE",
      minSelections: 1,
      maxSelections: 1,
      ...newPos
    };
    setPositions((prev) => [...prev, pos]);
    appendLog("POSITION_CREATED", "Admin", `Created electoral position: ${pos.title}`);
  };

  const updatePosition = (id, updates) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    appendLog("POSITION_UPDATED", "Admin", `Updated position details for ID: ${id}`);
  };

  const deletePosition = (id) => {
    const posToDelete = positions.find((p) => p.id === id);
    setPositions((prev) => prev.filter((p) => p.id !== id));
    // Also remove associated candidates
    setCandidates((prev) => prev.filter((c) => c.positionId !== id));
    appendLog("POSITION_DELETED", "Admin", `Removed position: ${posToDelete?.title || id}`);
  };

  const movePositionSequence = (id, direction) => {
    // direction: 'UP' or 'DOWN'
    const sorted = [...positions].sort((a, b) => a.sequence - b.sequence);
    const index = sorted.findIndex((p) => p.id === id);
    if (index === -1) return;

    if (direction === "UP" && index > 0) {
      const prevPos = sorted[index - 1];
      const curPos = sorted[index];
      const tempSeq = prevPos.sequence;
      prevPos.sequence = curPos.sequence;
      curPos.sequence = tempSeq;
    } else if (direction === "DOWN" && index < sorted.length - 1) {
      const nextPos = sorted[index + 1];
      const curPos = sorted[index];
      const tempSeq = nextPos.sequence;
      nextPos.sequence = curPos.sequence;
      curPos.sequence = tempSeq;
    }

    setPositions([...sorted]);
    appendLog("POSITIONS_REORDERED", "Admin", "Reordered electoral ballot sequence");
  };

  // 4. Admin Candidate Management
  const addCandidate = (newCand) => {
    const cand = {
      id: `cand_${Date.now()}`,
      votes: 0,
      avatarUrl: newCand.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      ...newCand
    };
    setCandidates((prev) => [...prev, cand]);
    appendLog("CANDIDATE_ADDED", "Admin", `Nominated candidate: ${cand.name} for position`);
  };

  const updateCandidate = (id, updates) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    appendLog("CANDIDATE_UPDATED", "Admin", `Updated candidate: ${updates.name || id}`);
  };

  const deleteCandidate = (id) => {
    const cand = candidates.find((c) => c.id === id);
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    appendLog("CANDIDATE_REMOVED", "Admin", `Removed candidate: ${cand?.name || id}`);
  };

  // 5. Admin Voter Roster Management
  const addVoter = (newVoter) => {
    const cleanId = newVoter.studentId.trim().toUpperCase();
    if (voters.some((v) => v.studentId.toUpperCase() === cleanId)) {
      return { success: false, message: "A student with this ID already exists!" };
    }
    const voter = {
      ...newVoter,
      studentId: cleanId,
      hasVoted: false,
      votedAt: null,
      authorizedAt: null,
      photoUrl: newVoter.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80"
    };
    setVoters((prev) => [voter, ...prev]);
    appendLog("VOTER_REGISTERED", "Admin", `Enrolled voter: ${voter.name} (${voter.studentId})`);
    return { success: true };
  };

  const updateVoter = (studentId, updates) => {
    setVoters((prev) =>
      prev.map((v) =>
        v.studentId.toUpperCase() === studentId.toUpperCase()
          ? { ...v, ...updates }
          : v
      )
    );
  };

  const deleteVoter = (studentId) => {
    setVoters((prev) =>
      prev.filter((v) => v.studentId.toUpperCase() !== studentId.toUpperCase())
    );
    appendLog("VOTER_REMOVED", "Admin", `Deleted voter record: ${studentId}`);
  };

  const importVotersBulk = (voterArray) => {
    const existingIds = new Set(voters.map((v) => v.studentId.toUpperCase()));
    const validNewVoters = voterArray
      .filter((v) => v.studentId && !existingIds.has(v.studentId.toUpperCase()))
      .map((v) => ({
        studentId: v.studentId.trim().toUpperCase(),
        name: v.name || "Student",
        fatherName: v.fatherName || "N/A",
        course: v.course || "General",
        semester: v.semester || "1st",
        photoUrl: v.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80",
        hasVoted: false,
        votedAt: null,
        authorizedAt: null
      }));

    setVoters((prev) => [...validNewVoters, ...prev]);
    appendLog("BULK_VOTER_IMPORT", "Admin", `Imported ${validNewVoters.length} new voters via CSV`);
    return validNewVoters.length;
  };

  // 6. Election Reset / Fresh Start
  const resetAllVotes = () => {
    setCandidates((prev) => prev.map((c) => ({ ...c, votes: 0 })));
    setVoters((prev) =>
      prev.map((v) => ({ ...v, hasVoted: false, votedAt: null, authorizedAt: null }))
    );
    setElectionConfig((prev) => ({
      ...prev,
      boothState: {
        status: "LOCKED",
        authorizedVoter: null,
        authorizedAt: null,
        activeBoothId: "BOOTH-ALPHA-01"
      }
    }));
    appendLog("ELECTION_RESET", "Admin", "All ballot counts and voter statuses were cleared for a fresh election run.");
  };

  // 7. Update Firebase Config directly from Admin UI
  const configureFirebase = (newConfig) => {
    saveFirebaseConfig(newConfig);
    const result = initFirebase(newConfig);
    setFirebaseStatus(result);
    return result;
  };

  // 8. Election Lifecycle Controls
  const setElectionStatus = (status) => {
    setElectionConfig((prev) => ({ ...prev, status }));
    appendLog("ELECTION_STATUS_CHANGE", "Admin", `Election status changed to: ${status}`);
  };

  const value = {
    electionConfig,
    positions: [...positions].sort((a, b) => a.sequence - b.sequence),
    candidates,
    voters,
    auditLogs,
    firebaseStatus,
    verifyStudent,
    authorizeVoterForBooth,
    cancelBoothAuthorization,
    castBallot,
    addPosition,
    updatePosition,
    deletePosition,
    movePositionSequence,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addVoter,
    updateVoter,
    deleteVoter,
    importVotersBulk,
    resetAllVotes,
    configureFirebase,
    setElectionStatus,
    setElectionConfig
  };

  return (
    <ElectionContext.Provider value={value}>
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error("useElection must be used within an ElectionProvider");
  }
  return context;
};
