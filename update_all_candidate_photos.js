import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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

const photos = JSON.parse(fs.readFileSync("candidate_jpeg_photos.json", "utf-8"));

const photoKeyMap = {
  cand_pres_1: "cand_pres_1",
  cand_vp_1: "cand_vp_1",
  cand_vp_2: "cand_vp_2",
  cand_vp_3: "cand_vp_3",
  cand_sec_1: "cand_sec_1",
  cand_sec_2: "cand_sec_2",
  cand_sec_3: "cand_sec_3",
  cand_sec_4: "cand_sec_4",
  cand_joint_1: "cand_jsec_1",
  cand_joint_2: "cand_jsec_2",
  cand_joint_3: "cand_jsec_3",
  cand_treasurer_1: "cand_treas_1",
  cand_treasurer_2: "cand_treas_2"
};

async function updatePhotos() {
  const candsSnap = await getDoc(doc(db, "elections", "candidates"));
  if (!candsSnap.exists()) {
    console.error("Candidates document does not exist!");
    process.exit(1);
  }

  const existingCands = candsSnap.data().candidates || [];
  console.log(`Found ${existingCands.length} existing candidates in Firestore.`);

  const rohit = existingCands.find(c => c.id === "cand_pres_2");
  const rohitPhoto = rohit?.avatarUrl || "";
  console.log(`Rohit photo length: ${rohitPhoto.length}`);

  const updatedCandidates = existingCands.map(cand => {
    if (cand.id === "cand_pres_2") {
      return {
        ...cand,
        avatarUrl: rohitPhoto
      };
    }
    const key = photoKeyMap[cand.id];
    const newPhoto = key ? photos[key] : null;
    if (newPhoto) {
      console.log(`Updating photo for ${cand.id} (${cand.name}): length=${newPhoto.length}`);
      return {
        ...cand,
        avatarUrl: newPhoto
      };
    }
    return cand;
  });

  const now = new Date().toISOString();
  await setDoc(doc(db, "elections", "candidates"), {
    candidates: updatedCandidates,
    updatedAt: now
  }, { merge: true });

  await setDoc(doc(db, "elections", "live_council_state"), {
    candidates: updatedCandidates
  }, { merge: true });

  console.log("Successfully updated all candidate photos in Firestore docs!");

  // Save full candidate array to local JSON for inspection and initialData syncing
  fs.writeFileSync("candidates_with_photos.json", JSON.stringify(updatedCandidates, null, 2), "utf-8");
  console.log("Wrote candidates_with_photos.json successfully!");
  process.exit(0);
}

updatePhotos().catch(err => {
  console.error(err);
  process.exit(1);
});
