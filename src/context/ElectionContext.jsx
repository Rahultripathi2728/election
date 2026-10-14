import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  initialElectionConfig, 
  initialStationCredentials,
  initialBooths,
  initialPositions, 
  initialCandidates, 
  initialVoters, 
  initialBallots,
  initialAuditLogs 
} from "../data/initialData";
import { soundManager } from "../utils/sound";
import { 
  initFirebase, 
  saveFirebaseConfig,
  getDb 
} from "../services/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import { DEFAULT_AVATAR } from "../utils/constants";
import { candidatePhotos } from "../data/candidatePhotos";

const STORAGE_KEY = "paperless_election_live_state";
const SYNC_CHANNEL_NAME = "paperless_election_broadcast_live";

const getInitialState = (key, fallback) => {
  try {
    const saved = 
      localStorage.getItem("paperless_election_live_state") || 
      localStorage.getItem("paperless_election_master_state_v8") ||
      localStorage.getItem("paperless_election_master_state_v7");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[key] && (!Array.isArray(parsed[key]) || parsed[key].length > 0)) {
        return parsed[key];
      }
    }
  } catch (e) {
    console.error(e);
  }
  return fallback;
};

const ElectionContext = createContext(null);

export const ElectionProvider = ({ children }) => {
  // Master Election State
  const [electionConfig, setElectionConfig] = useState(() => {
    const raw = getInitialState("electionConfig", initialElectionConfig);
    let updated = raw ? { ...raw } : { ...initialElectionConfig };
    if (!updated.booths || !Array.isArray(updated.booths) || updated.booths.length === 0) {
      updated.booths = initialBooths;
    }
    if (!updated.boothState) {
      updated.boothState = updated.booths[0];
    }
    if (!updated.stationCredentials) {
      updated.stationCredentials = initialStationCredentials;
    }
    updated.title = "SNA Student Nursing Council Elections 2026";
    updated.institution = "Graphic Era Hill University";
    updated.department = "College of Nursing";
    updated.bodyName = "Student Nurses' Association (SNA)";
    updated.scheduledTime = "3:00 PM (15:00 IST)";
    return updated;
  });
  const [positions, setPositions] = useState(() => getInitialState("positions", initialPositions));
  const [deletedCandidateIds, setDeletedCandidateIds] = useState(() => getInitialState("deletedCandidateIds", []));
  const [candidates, setCandidates] = useState(() => {
    const tombstone = getInitialState("deletedCandidateIds", []);
    const raw = getInitialState("candidates", initialCandidates);
    if (Array.isArray(raw)) {
      return raw
        .filter((c) => !tombstone.includes(c.id))
        .map((c) => {
          if (!c.avatarUrl || c.avatarUrl === DEFAULT_AVATAR || c.avatarUrl.startsWith("data:image/svg+xml")) {
            const realPhoto = candidatePhotos[c.id];
            if (realPhoto) return { ...c, avatarUrl: realPhoto };
          }
          return c;
        });
    }
    return initialCandidates.filter((c) => !tombstone.includes(c.id));
  });
  const [voters, setVoters] = useState(() => getInitialState("voters", initialVoters));
  const [ballots, setBallots] = useState(() => getInitialState("ballots", initialBallots));
  const [auditLogs, setAuditLogs] = useState(() => getInitialState("auditLogs", initialAuditLogs));

  const [firebaseStatus, setFirebaseStatus] = useState({
    connected: false,
    message: "Initializing real-time sync..."
  });

  const broadcastChannelRef = useRef(null);
  const isInternalUpdateRef = useRef(false);
  const isCloudInitializedRef = useRef(false);
  const ballotsByYearRef = useRef({ year1: [], year2: [], year3: [], year4: [] });

  // Helper for immediate, modular cloud persistence
  const persistDirectToCloud = async (partialUpdates) => {
    isCloudInitializedRef.current = true;
    const db = getDb();
    if (db) {
      try {
        const now = new Date().toISOString();
        const promises = [];
        if (partialUpdates.electionConfig) {
          promises.push(setDoc(doc(db, "elections", "config"), { electionConfig: partialUpdates.electionConfig, updatedAt: now }, { merge: true }));
        }
        if (partialUpdates.positions) {
          promises.push(setDoc(doc(db, "elections", "positions"), { positions: partialUpdates.positions, updatedAt: now }, { merge: true }));
        }
        if (partialUpdates.candidates || partialUpdates.deletedCandidateIds) {
          const candPayload = { updatedAt: now };
          if (partialUpdates.candidates) candPayload.candidates = partialUpdates.candidates;
          if (partialUpdates.deletedCandidateIds) candPayload.deletedCandidateIds = partialUpdates.deletedCandidateIds;
          promises.push(setDoc(doc(db, "elections", "candidates"), candPayload, { merge: true }));
        }
        if (partialUpdates.voters) {
          promises.push(setDoc(doc(db, "elections", "voters"), { voters: partialUpdates.voters, updatedAt: now }, { merge: true }));
        }
        if (partialUpdates.auditLogs) {
          promises.push(setDoc(doc(db, "elections", "auditLogs"), { auditLogs: partialUpdates.auditLogs, updatedAt: now }, { merge: true }));
        }
        // Also keep master backup doc updated
        promises.push(setDoc(doc(db, "elections", "live_council_state"), partialUpdates, { merge: true }));
        await Promise.all(promises);
      } catch (err) {
        console.warn("Direct Cloud Firestore save error:", err.message);
      }
    }
  };

  // Initialize Firebase, BroadcastChannel, and Modular Firestore Listeners
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
          if (payload.electionConfig) {
            setElectionConfig((prevConfig) => {
              // Prevent background sync from kicking out an active voter
              if (
                prevConfig?.boothState?.status === "UNLOCKED" &&
                payload.electionConfig?.boothState?.status === "LOCKED" &&
                !payload.isExplicitRevoke
              ) {
                return {
                  ...payload.electionConfig,
                  boothState: prevConfig.boothState
                };
              }
              return payload.electionConfig;
            });
          }
          if (payload.positions) setPositions(payload.positions);
          if (payload.candidates) setCandidates(payload.candidates);
          if (payload.voters) setVoters(payload.voters);
          if (payload.ballots) setBallots(payload.ballots);
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
          if (parsed.electionConfig) {
            setElectionConfig((prevConfig) => {
              if (
                prevConfig?.boothState?.status === "UNLOCKED" &&
                parsed.electionConfig?.boothState?.status === "LOCKED"
              ) {
                return {
                  ...parsed.electionConfig,
                  boothState: prevConfig.boothState
                };
              }
              return parsed.electionConfig;
            });
          }
          if (parsed.positions) setPositions(parsed.positions);
          if (parsed.candidates) setCandidates(parsed.candidates);
          if (parsed.voters) setVoters(parsed.voters);
          if (parsed.ballots) setBallots(parsed.ballots);
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

    // Live Modular Firestore listeners
    const unsubs = [];
    const db = getDb();
    if (db) {
      try {
        // 1. Config listener (Lock/Unlock/Status & Multi-Booths)
        unsubs.push(
          onSnapshot(doc(db, "elections", "config"), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.electionConfig) {
                let incomingConfig = { ...data.electionConfig };

                // Ensure booths array exists
                if (!incomingConfig.booths || !Array.isArray(incomingConfig.booths) || incomingConfig.booths.length === 0) {
                  incomingConfig.booths = initialBooths;
                }

                // Multi-Booth Sanitizer: If any booth says SUBMITTING but is older than 8s, auto-heal
                let hasHealed = false;
                incomingConfig.booths = incomingConfig.booths.map((b) => {
                  if (b.status === "SUBMITTING") {
                    const subTime = new Date(b.submittingAt || b.authorizedAt || 0).getTime();
                    if (subTime > 0 && Date.now() - subTime > 8000) {
                      hasHealed = true;
                      return { ...b, status: "LOCKED", authorizedVoter: null, authorizedAt: null, submittingAt: null };
                    }
                  }
                  return b;
                });

                if (incomingConfig.boothState?.status === "SUBMITTING") {
                  const subTime = new Date(incomingConfig.boothState.submittingAt || incomingConfig.boothState.authorizedAt || 0).getTime();
                  if (subTime > 0 && Date.now() - subTime > 8000) {
                    hasHealed = true;
                    incomingConfig.boothState = {
                      status: "LOCKED",
                      authorizedVoter: null,
                      authorizedAt: null,
                      activeBoothId: incomingConfig.boothState?.activeBoothId || "BOOTH-1"
                    };
                  }
                }

                if (hasHealed) {
                  setDoc(doc(db, "elections", "config"), { electionConfig: incomingConfig, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.warn);
                }

                isInternalUpdateRef.current = true;
                setElectionConfig((prev) => ({
                  ...incomingConfig,
                  booths: incomingConfig.booths || prev?.booths || initialBooths,
                  boothState: incomingConfig.boothState || prev?.boothState || (incomingConfig.booths ? incomingConfig.booths[0] : initialBooths[0]),
                  stationCredentials: incomingConfig.stationCredentials || prev?.stationCredentials || initialStationCredentials
                }));
                setTimeout(() => { isInternalUpdateRef.current = false; }, 50);
              }
            }
          })
        );

        // 2. Positions listener
        unsubs.push(
          onSnapshot(doc(db, "elections", "positions"), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.positions && Array.isArray(data.positions) && data.positions.length > 0) {
                isInternalUpdateRef.current = true;
                setPositions(data.positions);
                setTimeout(() => { isInternalUpdateRef.current = false; }, 50);
              }
            }
          })
        );

        // 3. Candidates listener (Holds candidates with crystal-clear HD portraits)
        unsubs.push(
          onSnapshot(doc(db, "elections", "candidates"), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const tombstone = Array.isArray(data.deletedCandidateIds) ? data.deletedCandidateIds : [];
              setDeletedCandidateIds(tombstone);
              if (data.candidates && Array.isArray(data.candidates)) {
                const filtered = data.candidates.filter((c) => !tombstone.includes(c.id));
                const enriched = filtered.map((c) => {
                  if (!c.avatarUrl || c.avatarUrl === DEFAULT_AVATAR || c.avatarUrl.startsWith("data:image/svg+xml")) {
                    const realPhoto = candidatePhotos[c.id];
                    if (realPhoto) return { ...c, avatarUrl: realPhoto };
                  }
                  return c;
                });
                isInternalUpdateRef.current = true;
                setCandidates(enriched);
                setTimeout(() => { isInternalUpdateRef.current = false; }, 50);
              }
            }
          })
        );

        // 4. Voters listener (All 233 students across 4 academic years)
        unsubs.push(
          onSnapshot(doc(db, "elections", "voters"), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.voters && Array.isArray(data.voters) && data.voters.length > 0) {
                isInternalUpdateRef.current = true;
                setVoters(data.voters);
                setTimeout(() => { isInternalUpdateRef.current = false; }, 50);
              }
            }
          })
        );

        // 5. AuditLogs listener
        unsubs.push(
          onSnapshot(doc(db, "elections", "auditLogs"), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data.auditLogs && Array.isArray(data.auditLogs)) {
                isInternalUpdateRef.current = true;
                setAuditLogs(data.auditLogs);
                setTimeout(() => { isInternalUpdateRef.current = false; }, 50);
              }
            }
          })
        );

        // 6. Year-wise Ballots listeners: Year 1, Year 2, Year 3, Year 4
        const syncCombinedBallots = () => {
          const combined = [
            ...(ballotsByYearRef.current.year1 || []),
            ...(ballotsByYearRef.current.year2 || []),
            ...(ballotsByYearRef.current.year3 || []),
            ...(ballotsByYearRef.current.year4 || [])
          ];
          combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          isInternalUpdateRef.current = true;
          setBallots(combined);
          setTimeout(() => { isInternalUpdateRef.current = false; }, 50);
        };

        unsubs.push(
          onSnapshot(doc(db, "elections", "ballots_year1"), (snapshot) => {
            if (snapshot.exists()) {
              ballotsByYearRef.current.year1 = snapshot.data().ballots || [];
              syncCombinedBallots();
            }
          })
        );

        unsubs.push(
          onSnapshot(doc(db, "elections", "ballots_year2"), (snapshot) => {
            if (snapshot.exists()) {
              ballotsByYearRef.current.year2 = snapshot.data().ballots || [];
              syncCombinedBallots();
            }
          })
        );

        unsubs.push(
          onSnapshot(doc(db, "elections", "ballots_year3"), (snapshot) => {
            if (snapshot.exists()) {
              ballotsByYearRef.current.year3 = snapshot.data().ballots || [];
              syncCombinedBallots();
            }
          })
        );

        unsubs.push(
          onSnapshot(doc(db, "elections", "ballots_year4"), (snapshot) => {
            if (snapshot.exists()) {
              ballotsByYearRef.current.year4 = snapshot.data().ballots || [];
              syncCombinedBallots();
            }
          })
        );

        isCloudInitializedRef.current = true;
      } catch (err) {
        console.warn("Firestore listeners note:", err);
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      unsubs.forEach((unsub) => unsub && unsub());
    };
  }, []);

  // Active Watchdog: Automatically auto-locks any booth stuck in SUBMITTING state
  useEffect(() => {
    let watchdogTimer = null;
    const boothsList = electionConfig?.booths && Array.isArray(electionConfig.booths) ? electionConfig.booths : [];
    const hasSubmitting = boothsList.some((b) => b.status === "SUBMITTING") || electionConfig?.boothState?.status === "SUBMITTING";

    if (hasSubmitting) {
      const delayMs = ((electionConfig.autoLockDelaySeconds || 4) + 1.5) * 1000;
      watchdogTimer = setTimeout(() => {
        setElectionConfig((prev) => {
          const list = prev?.booths && Array.isArray(prev.booths) ? prev.booths : initialBooths;
          const healed = list.map((b) =>
            b.status === "SUBMITTING"
              ? { ...b, status: "LOCKED", authorizedVoter: null, authorizedAt: null, submittingAt: null }
              : b
          );
          const lockedConfig = {
            ...prev,
            booths: healed,
            boothState: healed[0]
          };
          persistDirectToCloud({ electionConfig: lockedConfig });
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage({
              type: "STATE_SYNC",
              payload: { electionConfig: lockedConfig }
            });
          }
          appendLog(
            "EVM_AUTO_LOCKED",
            "System Watchdog",
            "EVM terminal automatically transitioned from SUBMITTING to LOCKED standby."
          );
          return lockedConfig;
        });
      }, delayMs);
    }
    return () => {
      if (watchdogTimer) clearTimeout(watchdogTimer);
    };
  }, [electionConfig?.booths, electionConfig?.boothState?.status, electionConfig?.autoLockDelaySeconds]);

  // Save to LocalStorage, BroadcastChannel, and Firestore Modular Documents
  useEffect(() => {
    if (isInternalUpdateRef.current) return;
    if (!isCloudInitializedRef.current) return;

    const fullState = {
      electionConfig,
      positions,
      candidates,
      voters,
      ballots,
      auditLogs
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
    } catch (e) {}

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "STATE_SYNC",
        payload: fullState
      });
    }

    // Push modular updates to Firestore
    const db = getDb();
    if (db) {
      try {
        const now = new Date().toISOString();
        Promise.all([
          setDoc(doc(db, "elections", "config"), { electionConfig, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", "positions"), { positions, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", "voters"), { voters, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", "auditLogs"), { auditLogs, updatedAt: now }, { merge: true })
        ]).catch((err) => {
          console.warn("Firestore sync write note:", err.message);
        });
      } catch (e) {
        console.warn("Firestore push notice:", e);
      }
    }
  }, [electionConfig, positions, candidates, voters, ballots, auditLogs]);

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

  const getVoterStatus = (voter) => {
    if (!voter) return { status: "NOT_FOUND", voter: null };
    if (voter.hasVoted) {
      return { status: "ALREADY_VOTED", voter };
    }
    const currentBooths = electionConfig.booths && Array.isArray(electionConfig.booths)
      ? electionConfig.booths
      : [electionConfig.boothState];
    const boothOccupied = currentBooths.find(
      (b) => b && (b.status === "UNLOCKED" || b.status === "SUBMITTING") &&
             b.authorizedVoter?.studentId?.toUpperCase() === voter.studentId.toUpperCase()
    );
    if (boothOccupied) {
      return { status: "IN_BOOTH", voter, booth: boothOccupied };
    }
    return { status: "ELIGIBLE", voter };
  };

  // 1. Voter Verification & Authorization (Search by ID or Name, handling multiple duplicate names)
  const verifyStudent = (query) => {
    if (!query) return null;
    const clean = query.trim().toUpperCase();

    // Priority 1: Exact Match on Student Roll / ID Number
    const exactIdMatch = voters.find((v) => v.studentId.toUpperCase() === clean);
    if (exactIdMatch) {
      return getVoterStatus(exactIdMatch);
    }

    // Priority 2: Match by Student Name (exact match or substring)
    const nameMatches = voters.filter((v) => {
      const vName = v.name.trim().toUpperCase();
      return vName === clean || vName.includes(clean);
    });

    if (nameMatches.length === 0) {
      return { status: "NOT_FOUND", voter: null, query };
    }

    if (nameMatches.length === 1) {
      return getVoterStatus(nameMatches[0]);
    }

    // Multiple Matches Found (e.g. 2 students named Rahul Kumar)
    return {
      status: "MULTIPLE_MATCHES",
      query,
      count: nameMatches.length,
      matches: nameMatches.map((v) => {
        const currentBooths = electionConfig.booths && Array.isArray(electionConfig.booths)
          ? electionConfig.booths
          : [electionConfig.boothState];
        const boothOccupied = currentBooths.find(
          (b) => b && (b.status === "UNLOCKED" || b.status === "SUBMITTING") &&
                 b.authorizedVoter?.studentId?.toUpperCase() === v.studentId.toUpperCase()
        );
        return {
          ...v,
          currentStatus: v.hasVoted
            ? "ALREADY_VOTED"
            : boothOccupied
            ? "IN_BOOTH"
            : "ELIGIBLE",
          occupiedBooth: boothOccupied
        };
      })
    };
  };

  const authorizeVoterForBooth = (studentId, requestedBoothId = null) => {
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

    const currentBooths = electionConfig.booths && Array.isArray(electionConfig.booths) && electionConfig.booths.length > 0
      ? electionConfig.booths
      : initialBooths;

    // Pick requested booth or first available free booth
    let targetBoothId = requestedBoothId;
    if (!targetBoothId) {
      const freeBooth = currentBooths.find((b) => b.status === "LOCKED");
      targetBoothId = freeBooth ? freeBooth.id : currentBooths[0].id;
    }

    const targetBoothObj = currentBooths.find((b) => b.id === targetBoothId) || currentBooths[0];

    const now = new Date().toISOString();

    // Mark voter as authorized
    setVoters((prev) =>
      prev.map((v) =>
        v.studentId.toUpperCase() === cleanId
          ? { ...v, authorizedAt: now }
          : v
      )
    );

    const voterPayload = {
      studentId: voter.studentId,
      name: voter.name,
      fatherName: voter.fatherName,
      course: voter.course,
      year: voter.year,
      semester: voter.semester,
      photoUrl: voter.photoUrl
    };

    const updatedBooths = currentBooths.map((b) =>
      b.id === targetBoothId
        ? {
            ...b,
            status: "UNLOCKED",
            authorizedVoter: voterPayload,
            authorizedAt: now,
            submittingAt: null
          }
        : b
    );

    const primaryBooth = updatedBooths.find((b) => b.id === targetBoothId) || updatedBooths[0];

    const updatedBoothConfig = {
      ...electionConfig,
      booths: updatedBooths,
      boothState: primaryBooth
    };

    setElectionConfig(updatedBoothConfig);
    persistDirectToCloud({ electionConfig: updatedBoothConfig });
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "STATE_SYNC",
        payload: { electionConfig: updatedBoothConfig }
      });
    }

    soundManager.playAuthorizeChime();
    appendLog(
      "VOTER_AUTHORIZED",
      `Verification Desk (${targetBoothObj.shortName || targetBoothId})`,
      `Authorized ${voter.name} (${voter.studentId}, ${voter.year}) for ${targetBoothObj.name || targetBoothId}`
    );

    return { 
      success: true, 
      boothId: targetBoothId,
      boothName: targetBoothObj.shortName || targetBoothObj.name || targetBoothId,
      message: `Voter ${voter.name} authorized for ${targetBoothObj.shortName || targetBoothObj.name}!` 
    };
  };

  const cancelBoothAuthorization = (targetBoothId = null) => {
    const currentBooths = electionConfig.booths && Array.isArray(electionConfig.booths) && electionConfig.booths.length > 0
      ? electionConfig.booths
      : initialBooths;

    let revokedVoterName = "";
    const updatedBooths = currentBooths.map((b) => {
      if (!targetBoothId || b.id === targetBoothId) {
        if (b.authorizedVoter) revokedVoterName = b.authorizedVoter.name;
        return {
          ...b,
          status: "LOCKED",
          authorizedVoter: null,
          authorizedAt: null,
          submittingAt: null
        };
      }
      return b;
    });

    const lockedBoothConfig = {
      ...electionConfig,
      booths: updatedBooths,
      boothState: updatedBooths[0]
    };

    setElectionConfig(lockedBoothConfig);
    persistDirectToCloud({ electionConfig: lockedBoothConfig });
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "STATE_SYNC",
        payload: { electionConfig: lockedBoothConfig, isExplicitRevoke: true }
      });
    }

    soundManager.playSelectBeep();
    if (revokedVoterName) {
      appendLog(
        "AUTHORIZATION_REVOKED",
        "Polling Officer",
        `Authorization revoked for ${revokedVoterName}. EVM Terminal reset to Locked Standby.`
      );
    }
    return { success: true };
  };

  // 2. Cast Ballot from EVM Terminal & Record Detailed Vote Trail (Year-wise routing)
  const castBallot = async (selections, sourceBoothId = null) => {
    // selections is { [positionId]: candidateId | 'NOTA' }
    const currentBooths = electionConfig.booths && Array.isArray(electionConfig.booths) && electionConfig.booths.length > 0
      ? electionConfig.booths
      : initialBooths;

    const targetBooth = (sourceBoothId ? currentBooths.find((b) => b.id === sourceBoothId) : null) ||
      currentBooths.find((b) => b.authorizedVoter) ||
      currentBooths[0];

    const currentVoter = targetBooth.authorizedVoter;
    if (!currentVoter) {
      soundManager.playErrorBuzzer();
      return { success: false, message: "No authorized voter at terminal." };
    }

    const voterId = currentVoter.studentId;
    const now = new Date().toISOString();

    // 1. Increment candidate vote counts
    const updatedCandidates = candidates.map((cand) => {
      const votedForThis = selections[cand.positionId] === cand.id;
      if (votedForThis) {
        return { ...cand, votes: (cand.votes || 0) + 1 };
      }
      return cand;
    });
    setCandidates(updatedCandidates);

    // 2. Mark voter as permanently voted
    const updatedVoters = voters.map((v) =>
      v.studentId.toUpperCase() === voterId.toUpperCase()
        ? { ...v, hasVoted: true, votedAt: now }
        : v
    );
    setVoters(updatedVoters);

    // 3. Determine Year doc accurately across 4 Academic Years
    const voterYear = currentVoter.year || "1st Year";
    const voterSem = currentVoter.semester || "1st Semester";
    let targetDocName = "ballots_year1";
    let yearKey = "year1";

    if (voterYear === "2nd Year" || voterSem === "3rd Semester") {
      targetDocName = "ballots_year2";
      yearKey = "year2";
    } else if (voterYear === "3rd Year" || voterSem === "5th Semester") {
      targetDocName = "ballots_year3";
      yearKey = "year3";
    } else if (voterYear === "4th Year" || voterSem === "7th Semester") {
      targetDocName = "ballots_year4";
      yearKey = "year4";
    }

    // 4. Record full transparent Ballot choice
    const newBallotRecord = {
      id: `ballot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now,
      voterId: currentVoter.studentId,
      voterName: currentVoter.name,
      course: currentVoter.course,
      year: voterYear,
      semester: voterSem,
      fatherName: currentVoter.fatherName,
      boothId: targetBooth.id || "BOOTH-1",
      selections: { ...selections }
    };

    ballotsByYearRef.current[yearKey] = [newBallotRecord, ...(ballotsByYearRef.current[yearKey] || [])];
    const updatedMasterBallots = [newBallotRecord, ...ballots];
    setBallots(updatedMasterBallots);

    // 5. Play iconic long EVM confirmation tone!
    soundManager.playVoteConfirmationBeep();

    // 6. Update booth state to SUBMITTING, then lock after autoLockDelaySeconds
    const updatedSubmittingBooths = currentBooths.map((b) =>
      b.id === targetBooth.id
        ? { ...b, status: "SUBMITTING", submittingAt: now }
        : b
    );

    const submittingBoothState = {
      ...electionConfig,
      booths: updatedSubmittingBooths,
      boothState: {
        ...targetBooth,
        status: "SUBMITTING",
        submittingAt: now
      }
    };
    setElectionConfig(submittingBoothState);

    // 7. Atomic Push to Modular Documents
    const db = getDb();
    if (db) {
      try {
        await Promise.all([
          setDoc(doc(db, "elections", "candidates"), { candidates: updatedCandidates, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", "voters"), { voters: updatedVoters, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", targetDocName), {
            ballots: ballotsByYearRef.current[yearKey],
            year: voterYear,
            semester: voterSem,
            updatedAt: now
          }, { merge: true }),
          setDoc(doc(db, "elections", "config"), { electionConfig: submittingBoothState, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", "live_council_state"), {
            candidates: updatedCandidates,
            voters: updatedVoters,
            ballots: updatedMasterBallots,
            electionConfig: submittingBoothState
          }, { merge: true })
        ]);
      } catch (err) {
        console.warn("Direct modular ballot save note:", err);
      }
    }

    appendLog(
      "BALLOT_CAST",
      `EVM Booth (${targetBooth.name || targetBooth.id})`,
      `Official ballot recorded securely for ${currentVoter.name} (${currentVoter.studentId}, ${voterYear} - ${voterSem}). Terminal locked.`
    );

    setTimeout(() => {
      setElectionConfig((prev) => {
        const boothsList = prev?.booths && Array.isArray(prev.booths) ? prev.booths : initialBooths;
        const reLockedBooths = boothsList.map((b) =>
          b.id === targetBooth.id
            ? { ...b, status: "LOCKED", authorizedVoter: null, authorizedAt: null, submittingAt: null }
            : b
        );
        const lockedConfig = {
          ...prev,
          booths: reLockedBooths,
          boothState: reLockedBooths[0]
        };
        persistDirectToCloud({ electionConfig: lockedConfig });
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: "STATE_SYNC",
            payload: { electionConfig: lockedConfig }
          });
        }
        return lockedConfig;
      });
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
    const nextPositions = [...positions, pos];
    setPositions(nextPositions);
    appendLog("POSITION_CREATED", "Admin", `Created electoral position: ${pos.title}`);
    persistDirectToCloud({ positions: nextPositions });
  };

  const updatePosition = (id, updates) => {
    const nextPositions = positions.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPositions(nextPositions);
    appendLog("POSITION_UPDATED", "Admin", `Updated position details for ID: ${id}`);
    persistDirectToCloud({ positions: nextPositions });
  };

  const deletePosition = (id) => {
    const posToDelete = positions.find((p) => p.id === id);
    const nextPositions = positions.filter((p) => p.id !== id);
    const nextCandidates = candidates.filter((c) => c.positionId !== id);
    setPositions(nextPositions);
    setCandidates(nextCandidates);
    appendLog("POSITION_DELETED", "Admin", `Removed position: ${posToDelete?.title || id}`);
    persistDirectToCloud({ positions: nextPositions, candidates: nextCandidates });
  };

  const movePositionSequence = (id, direction) => {
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

    const nextPositions = [...sorted];
    setPositions(nextPositions);
    appendLog("POSITIONS_REORDERED", "Admin", "Reordered electoral ballot sequence");
    persistDirectToCloud({ positions: nextPositions });
  };

  // 4. Admin Candidate Management
  const addCandidate = (candData) => {
    const newCand = {
      id: `cand_${Date.now()}`,
      votes: 0,
      manifesto: "",
      symbolIcon: "",
      symbolName: "",
      avatarUrl: DEFAULT_AVATAR,
      ...candData
    };
    const nextCandidates = [...candidates, newCand];
    setCandidates(nextCandidates);
    appendLog("CANDIDATE_NOMINATED", "Admin", `Nominated candidate: ${newCand.name} for position ID: ${newCand.positionId}`);
    persistDirectToCloud({ candidates: nextCandidates });
  };

  const updateCandidate = (id, updates) => {
    const nextCandidates = candidates.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCandidates(nextCandidates);
    appendLog("CANDIDATE_UPDATED", "Admin", `Updated candidate details for ID: ${id}`);
    persistDirectToCloud({ candidates: nextCandidates });
  };

  const deleteCandidate = (id) => {
    const cand = candidates.find((c) => c.id === id);
    const nextCandidates = candidates.filter((c) => c.id !== id);
    const nextDeletedIds = Array.from(new Set([...deletedCandidateIds, id]));
    setCandidates(nextCandidates);
    setDeletedCandidateIds(nextDeletedIds);
    appendLog("CANDIDATE_DELETED", "Admin", `Removed nominee: ${cand?.name || id}`);
    persistDirectToCloud({ candidates: nextCandidates, deletedCandidateIds: nextDeletedIds });
  };

  // 5. Voter Roll Management
  const addVoter = (voterData) => {
    const existing = voters.find(
      (v) => v.studentId.toUpperCase() === voterData.studentId.trim().toUpperCase()
    );
    if (existing) {
      return { success: false, message: `Voter ID ${voterData.studentId} already exists in register!` };
    }

    const newVoter = {
      ...voterData,
      studentId: voterData.studentId.trim().toUpperCase(),
      photoUrl: voterData.photoUrl || DEFAULT_AVATAR,
      hasVoted: false,
      votedAt: null,
      authorizedAt: null
    };

    const nextVoters = [newVoter, ...voters];
    setVoters(nextVoters);
    persistDirectToCloud({ voters: nextVoters });
    appendLog("VOTER_REGISTERED", "Verification Desk", `Added eligible voter: ${newVoter.name} (${newVoter.studentId}, ${newVoter.year || "1st Year"})`);
    return { success: true, voter: newVoter };
  };

  const updateVoter = (studentId, updates) => {
    setVoters((prev) =>
      prev.map((v) => (v.studentId === studentId ? { ...v, ...updates } : v))
    );
  };

  const deleteVoter = (studentId) => {
    setVoters((prev) => prev.filter((v) => v.studentId !== studentId));
    appendLog("VOTER_REMOVED", "Admin", `Removed voter ID: ${studentId} from electoral roll`);
  };

  const importVotersBulk = (voterArray) => {
    const existingIds = new Set(voters.map((v) => v.studentId.toUpperCase()));
    const validNewVoters = voterArray
      .filter((v) => v.studentId && !existingIds.has(v.studentId.trim().toUpperCase()))
      .map((v) => ({
        studentId: v.studentId.trim().toUpperCase(),
        name: v.name.trim(),
        fatherName: v.fatherName || "N/A",
        course: v.course || "B.Tech General",
        year: v.year || "1st Year",
        semester: v.semester || "1st Semester",
        photoUrl: v.photoUrl || DEFAULT_AVATAR,
        hasVoted: false,
        votedAt: null,
        authorizedAt: null
      }));

    setVoters((prev) => [...validNewVoters, ...prev]);
    appendLog("BULK_VOTER_IMPORT", "Admin", `Imported ${validNewVoters.length} new voters via CSV`);
    return validNewVoters.length;
  };

  // 6. Reset / Reseed Operations (Modular Multi-Document Aware)
  const resetAllVotes = async () => {
    const resetCandidates = candidates.map((c) => ({ ...c, votes: 0 }));
    const resetVoters = voters.map((v) => ({ ...v, hasVoted: false, votedAt: null, authorizedAt: null }));
    const resetConfig = {
      ...electionConfig,
      boothState: {
        status: "LOCKED",
        authorizedVoter: null,
        authorizedAt: null,
        activeBoothId: "BOOTH-ALPHA-01"
      }
    };

    setCandidates(resetCandidates);
    setVoters(resetVoters);
    setBallots([]);
    setElectionConfig(resetConfig);

    ballotsByYearRef.current = { year1: [], year2: [], year3: [], year4: [] };

    const db = getDb();
    if (db) {
      try {
        const now = new Date().toISOString();
        await Promise.all([
          setDoc(doc(db, "elections", "config"), { electionConfig: resetConfig, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", "candidates"), { candidates: resetCandidates, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", "voters"), { voters: resetVoters, updatedAt: now }, { merge: true }),
          setDoc(doc(db, "elections", "ballots_year1"), { ballots: [], year: "1st Year", semester: "1st Semester", updatedAt: now }),
          setDoc(doc(db, "elections", "ballots_year2"), { ballots: [], year: "2nd Year", semester: "3rd Semester", updatedAt: now }),
          setDoc(doc(db, "elections", "ballots_year3"), { ballots: [], year: "3rd Year", semester: "5th Semester", updatedAt: now }),
          setDoc(doc(db, "elections", "ballots_year4"), { ballots: [], year: "4th Year", semester: "7th Semester", updatedAt: now }),
          setDoc(doc(db, "elections", "live_council_state"), {
            electionConfig: resetConfig,
            candidates: resetCandidates,
            voters: resetVoters,
            ballots: []
          }, { merge: true })
        ]);
      } catch (err) {
        console.warn("Reset modular cloud error:", err);
      }
    }

    appendLog("ELECTION_RESET", "Admin", "All ballot counts and voter statuses were cleared across all 4 academic years for a fresh election run.");
  };

  const reseedCompleteDatabase = async () => {
    setPositions(initialPositions);
    setCandidates(initialCandidates);
    setVoters(initialVoters);
    setBallots(initialBallots);
    setAuditLogs(initialAuditLogs);
    setElectionConfig(initialElectionConfig);

    ballotsByYearRef.current = { year1: [], year2: [], year3: [], year4: [] };

    const db = getDb();
    if (db) {
      try {
        const now = new Date().toISOString();
        await Promise.all([
          setDoc(doc(db, "elections", "config"), { electionConfig: initialElectionConfig, updatedAt: now }),
          setDoc(doc(db, "elections", "positions"), { positions: initialPositions, updatedAt: now }),
          setDoc(doc(db, "elections", "candidates"), { candidates: initialCandidates, updatedAt: now }),
          setDoc(doc(db, "elections", "voters"), { voters: initialVoters, updatedAt: now }),
          setDoc(doc(db, "elections", "auditLogs"), { auditLogs: initialAuditLogs, updatedAt: now }),
          setDoc(doc(db, "elections", "ballots_year1"), { ballots: [], year: "1st Year", semester: "1st Semester", updatedAt: now }),
          setDoc(doc(db, "elections", "ballots_year2"), { ballots: [], year: "2nd Year", semester: "3rd Semester", updatedAt: now }),
          setDoc(doc(db, "elections", "ballots_year3"), { ballots: [], year: "3rd Year", semester: "5th Semester", updatedAt: now }),
          setDoc(doc(db, "elections", "ballots_year4"), { ballots: [], year: "4th Year", semester: "7th Semester", updatedAt: now }),
          setDoc(doc(db, "elections", "live_council_state"), {
            electionConfig: initialElectionConfig,
            positions: initialPositions,
            candidates: initialCandidates,
            voters: initialVoters,
            ballots: initialBallots,
            auditLogs: initialAuditLogs
          })
        ]);
      } catch (err) {
        console.warn("Reseed modular cloud error:", err);
      }
    }
    appendLog("DATABASE_RESEEDED", "Admin", `Restored official ${initialVoters.length} student voters database (B.Sc Nursing 1st, 3rd, 5th & 7th Semesters across all 4 years) and official electoral positions.`);
    return true;
  };

  // 7. Explicit Cloud Sync Helper (Modular Multi-Document Push)
  const forcePushToFirestore = async () => {
    const db = getDb();
    if (!db) {
      return { success: false, message: "Firebase is not initialized. Please verify configuration." };
    }
    try {
      const now = new Date().toISOString();
      const bYear1 = ballots.filter(b => b.year === '1st Year' || b.semester === '1st Semester');
      const bYear2 = ballots.filter(b => b.year === '2nd Year' || b.semester === '3rd Semester');
      const bYear3 = ballots.filter(b => b.year === '3rd Year' || b.semester === '5th Semester');
      const bYear4 = ballots.filter(b => b.year === '4th Year' || b.semester === '7th Semester');

      const fullState = {
        electionConfig,
        positions,
        candidates,
        voters,
        ballots,
        auditLogs
      };

      await Promise.all([
        setDoc(doc(db, "elections", "config"), { electionConfig, updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "positions"), { positions, updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "candidates"), { candidates, updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "voters"), { voters, updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "auditLogs"), { auditLogs, updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "ballots_year1"), { ballots: bYear1, year: "1st Year", semester: "1st Semester", updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "ballots_year2"), { ballots: bYear2, year: "2nd Year", semester: "3rd Semester", updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "ballots_year3"), { ballots: bYear3, year: "3rd Year", semester: "5th Semester", updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "ballots_year4"), { ballots: bYear4, year: "4th Year", semester: "7th Semester", updatedAt: now }, { merge: true }),
        setDoc(doc(db, "elections", "live_council_state"), fullState, { merge: true })
      ]);

      appendLog("FIREBASE_SYNC_PUSH", "Admin", `Synchronized modular state across 4 academic years to Cloud Firestore (election-live-8921a)`);
      return { 
        success: true, 
        message: `Successfully synchronized ${voters.length} registered students and ${ballots.length} ballots across 4 academic years to Cloud Firestore!` 
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // 8. Update Firebase Config directly from Admin UI
  const configureFirebase = (newConfig) => {
    saveFirebaseConfig(newConfig);
    const result = initFirebase(newConfig);
    setFirebaseStatus(result);
    return result;
  };

  // 9. Election Lifecycle Controls
  const setElectionStatus = (status) => {
    setElectionConfig((prev) => ({ ...prev, status }));
    appendLog("ELECTION_STATUS_CHANGE", "Admin", `Election status changed to: ${status}`);
  };

  const setElectionStage = (stage) => {
    // stage: "PRE_POLL" | "LIVE_POLL" | "CONCLUDED"
    setElectionConfig((prev) => {
      const updated = {
        ...prev,
        electionStage: stage,
        status: stage === "CONCLUDED" ? "CONCLUDED" : "ACTIVE"
      };
      persistDirectToCloud({ electionConfig: updated });
      return updated;
    });
    appendLog("ELECTION_STAGE_CHANGE", "Admin", `Public election stage updated to: ${stage}`);
  };

  const publishBulletin = (bulletinData) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const totalVotersCount = voters.length;
    const votedCount = voters.filter((v) => v.hasVoted).length;
    const turnoutPct = totalVotersCount > 0 ? ((votedCount / totalVotersCount) * 100).toFixed(1) : 0;

    const newBulletin = {
      id: `bulletin_${Date.now()}`,
      postedAt: timeStr,
      title: bulletinData?.title || `Official Update (${timeStr})`,
      message: bulletinData?.message || "",
      turnoutPercent: bulletinData?.includeTurnout ? turnoutPct : null,
      ballotsCount: bulletinData?.includeTurnout ? votedCount : null
    };

    setElectionConfig((prev) => {
      const updated = {
        ...prev,
        activeBulletin: newBulletin,
        publishedBulletins: [newBulletin, ...(prev?.publishedBulletins || [])]
      };
      persistDirectToCloud({ electionConfig: updated });
      return updated;
    });

    appendLog("BULLETIN_PUBLISHED", "Admin", `Published public bulletin: ${newBulletin.title}`);
    return { success: true, bulletin: newBulletin };
  };

  const clearBulletin = () => {
    setElectionConfig((prev) => {
      const updated = {
        ...prev,
        activeBulletin: null
      };
      persistDirectToCloud({ electionConfig: updated });
      return updated;
    });
    appendLog("BULLETIN_CLEARED", "Admin", `Removed active public bulletin.`);
  };

  // 10. Update Station Security Passwords (Production Hardening)
  const updateStationCredentials = (newCredentials) => {
    const updated = {
      ...electionConfig,
      stationCredentials: newCredentials
    };
    setElectionConfig(updated);
    persistDirectToCloud({ electionConfig: updated });
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "STATE_SYNC",
        payload: { electionConfig: updated }
      });
    }
    appendLog(
      "SECURITY_CREDENTIALS_UPDATED",
      "Chief Electoral Officer",
      "Station security access passcodes were updated and synchronized across all terminals."
    );
    return { success: true, message: "Station passwords updated successfully!" };
  };

  const value = {
    electionConfig,
    booths: electionConfig?.booths || initialBooths,
    initialBooths,
    initialStationCredentials,
    updateStationCredentials,
    positions: [...positions].sort((a, b) => a.sequence - b.sequence),
    candidates,
    voters,
    ballots,
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
    deletedCandidateIds,
    addVoter,
    updateVoter,
    deleteVoter,
    importVotersBulk,
    resetAllVotes,
    reseedCompleteDatabase,
    forcePushToFirestore,
    configureFirebase,
    setElectionStatus,
    setElectionStage,
    publishBulletin,
    clearBulletin,
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
