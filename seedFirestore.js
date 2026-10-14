import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { 
  initialElectionConfig, 
  initialPositions, 
  initialCandidates, 
  initialVoters, 
  initialBallots, 
  initialAuditLogs 
} from "./src/data/initialData.js";

const firebaseConfig = {
  apiKey: "AIzaSyBLHp185MB1hqBWyakKrgWgRVEzJAUgHYg",
  authDomain: "election-live-8921a.firebaseapp.com",
  projectId: "election-live-8921a",
  storageBucket: "election-live-8921a.firebasestorage.app",
  messagingSenderId: "171253767960",
  appId: "1:171253767960:web:3f7b0c179aaaaa2e16486d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding Firestore project: election-live-8921a...");
  const electionDocRef = doc(db, "elections", "live_council_state");
  const fullState = {
    electionConfig: initialElectionConfig,
    positions: initialPositions,
    candidates: initialCandidates,
    voters: initialVoters,
    ballots: initialBallots,
    auditLogs: initialAuditLogs
  };
  await setDoc(electionDocRef, fullState);
  console.log(`Successfully seeded ${initialVoters.length} official student voters (B.Sc Nursing 1st, 3rd, 5th & 7th Semesters) into Cloud Firestore doc: elections/live_council_state!`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
