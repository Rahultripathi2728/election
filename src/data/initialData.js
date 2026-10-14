// Default initial election dataset
import { DEFAULT_AVATAR } from "../utils/constants.js";
import { candidatePhotos } from "./candidatePhotos.js";

export const initialStationCredentials = {
  admin: {
    role: "admin",
    username: "admin",
    passcode: "admin123",
    label: "Chief Electoral Officer (Admin)"
  },
  verify: {
    role: "verify",
    username: "officer",
    passcode: "verify123",
    label: "Verification Officer Desk"
  },
  evm: {
    role: "evm",
    username: "booth",
    passcode: "booth123",
    label: "EVM Voting Terminal"
  },
  live: {
    role: "live",
    username: "live",
    passcode: "live123",
    label: "Public Results Display"
  }
};

export const initialBooths = [
  {
    id: "BOOTH-1",
    name: "EVM Terminal 01 (Alpha)",
    shortName: "Booth #1",
    status: "LOCKED", // "LOCKED" | "UNLOCKED" | "SUBMITTING"
    authorizedVoter: null,
    authorizedAt: null,
    submittingAt: null
  },
  {
    id: "BOOTH-2",
    name: "EVM Terminal 02 (Beta)",
    shortName: "Booth #2",
    status: "LOCKED",
    authorizedVoter: null,
    authorizedAt: null,
    submittingAt: null
  },
  {
    id: "BOOTH-3",
    name: "EVM Terminal 03 (Gamma)",
    shortName: "Booth #3",
    status: "LOCKED",
    authorizedVoter: null,
    authorizedAt: null,
    submittingAt: null
  }
];

export const initialElectionConfig = {
  title: "SNA Student Nursing Council Elections 2026",
  institution: "Graphic Era Hill University",
  department: "College of Nursing",
  bodyName: "Student Nurses' Association (SNA)",
  electionId: "SNA-GEHU-2026",
  scheduledDate: "Today",
  scheduledTime: "3:00 PM (15:00 IST)",
  scheduledTimestamp: new Date().setHours(15, 0, 0, 0),
  status: "ACTIVE", // "SETUP" | "ACTIVE" | "PAUSED" | "CONCLUDED"
  electionStage: "LIVE_POLL", // "PRE_POLL" | "LIVE_POLL" | "CONCLUDED"
  activeBulletin: null,
  publishedBulletins: [],
  allowNota: true,
  autoLockDelaySeconds: 4,
  booths: initialBooths,
  boothState: initialBooths[0],
  stationCredentials: initialStationCredentials
};

export const initialPositions = [
  {
    id: "pos_pres",
    title: "President",
    description: "Chief Executive Representative of the Student Body",
    sequence: 1,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE",
    allowNota: true
  },
  {
    id: "pos_vp",
    title: "Vice President",
    description: "Academic Affairs & Inter-Departmental Coordinator",
    sequence: 2,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE",
    allowNota: true
  },
  {
    id: "pos_sec",
    title: "Secretary",
    description: "Administrative Liaison & Student Welfare Coordinator",
    sequence: 3,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE",
    allowNota: true
  },
  {
    id: "pos_joint_sec",
    title: "Joint Secretary",
    description: "Executive Assistant to Secretary & Departmental Affairs",
    sequence: 4,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE",
    allowNota: true
  },
  {
    id: "pos_treasurer",
    title: "Treasurer",
    description: "Finance, Budget Management & Student Activity Accounts",
    sequence: 5,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE",
    allowNota: true
  }
];

export const initialCandidates = [
  // --- PRESIDENT (pos_pres) ---
  {
    id: "cand_pres_1",
    positionId: "pos_pres",
    name: "Shiwani Bhandari",
    rollNo: "24962065-PG",
    department: "B.Sc Nursing",
    year: "5th Semester (3rd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_pres_1"] || DEFAULT_AVATAR,
    manifesto: "Clinical training support, student rights advocacy, and streamlined departmental academic communication.",
    votes: 0
  },
  {
    id: "cand_pres_2",
    positionId: "pos_pres",
    name: "Rohit Raj Ranjan",
    rollNo: "24631013",
    department: "B.Sc Nursing",
    year: "5th Semester (3rd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_pres_2"] || DEFAULT_AVATAR,
    manifesto: "Enhancing practical lab resources, clinical rotation scheduling transparency, and campus student welfare.",
    votes: 0
  },

  // --- VICE PRESIDENT (pos_vp) ---
  {
    id: "cand_vp_1",
    positionId: "pos_vp",
    name: "Karnika Koranga",
    rollNo: "24962064",
    department: "B.Sc Nursing",
    year: "5th Semester (3rd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_vp_1"] || DEFAULT_AVATAR,
    manifesto: "Academic mentorship programs, healthcare seminar workshops, and student grievance support.",
    votes: 0
  },
  {
    id: "cand_vp_2",
    positionId: "pos_vp",
    name: "Kartik Prakash",
    rollNo: "24961069",
    department: "B.Sc Nursing",
    year: "5th Semester (3rd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_vp_2"] || DEFAULT_AVATAR,
    manifesto: "Inter-department coordination, library medical journal access, and student health initiatives.",
    votes: 0
  },
  {
    id: "cand_vp_3",
    positionId: "pos_vp",
    name: "Sanjana Chauhan",
    rollNo: "24962065",
    department: "B.Sc Nursing",
    year: "5th Semester (3rd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_vp_3"] || DEFAULT_AVATAR,
    manifesto: "Student unity across batches, active representation in administration, and academic workshop support.",
    votes: 0
  },

  // --- SECRETARY (pos_sec) ---
  {
    id: "cand_sec_1",
    positionId: "pos_sec",
    name: "Anshika Sharma",
    rollNo: "24962048",
    department: "B.Sc Nursing",
    year: "5th Semester (3rd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_sec_1"] || DEFAULT_AVATAR,
    manifesto: "Timely administrative notifications, paperless event approvals, and responsive student council liaison.",
    votes: 0
  },
  {
    id: "cand_sec_2",
    positionId: "pos_sec",
    name: "Monika Rawat",
    rollNo: "24962043",
    department: "B.Sc Nursing",
    year: "5th Semester (3rd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_sec_2"] || DEFAULT_AVATAR,
    manifesto: "Strengthening communication between faculty and nursing students, organized official records.",
    votes: 0
  },
  {
    id: "cand_sec_3",
    positionId: "pos_sec",
    name: "Shreya Chuphal",
    rollNo: "25101120090",
    department: "B.Sc Nursing",
    year: "3rd Semester (2nd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_sec_3"] || DEFAULT_AVATAR,
    manifesto: "Junior-senior academic collaboration, clinical duty orientation programs, and student welfare.",
    votes: 0
  },
  {
    id: "cand_sec_4",
    positionId: "pos_sec",
    name: "Mahi Danpali",
    rollNo: "25101120051",
    department: "B.Sc Nursing",
    year: "3rd Semester (2nd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_sec_4"] || DEFAULT_AVATAR,
    manifesto: "Active grievance redressal, cultural event coordination, and student engagement activities.",
    votes: 0
  },

  // --- JOINT SECRETARY (pos_joint_sec) ---
  {
    id: "cand_joint_1",
    positionId: "pos_joint_sec",
    name: "Harshita Pandey",
    rollNo: "25101120104",
    department: "B.Sc Nursing",
    year: "3rd Semester (2nd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_joint_1"] || DEFAULT_AVATAR,
    manifesto: "Support for student welfare, helping organize academic schedules and clinical orientation.",
    votes: 0
  },
  {
    id: "cand_joint_2",
    positionId: "pos_joint_sec",
    name: "Nitin",
    rollNo: "26961063",
    department: "B.Sc Nursing",
    year: "1st Semester (1st Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_joint_2"] || DEFAULT_AVATAR,
    manifesto: "Freshers' guidance, batch coordination with council, and assisting secretarial duties.",
    votes: 0
  },
  {
    id: "cand_joint_3",
    positionId: "pos_joint_sec",
    name: "Chetna",
    rollNo: "26962038",
    department: "B.Sc Nursing",
    year: "1st Semester (1st Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_joint_3"] || DEFAULT_AVATAR,
    manifesto: "1st Year student voice, proactive involvement in university activities, and peer support.",
    votes: 0
  },

  // --- TREASURER (pos_treasurer) ---
  {
    id: "cand_treasurer_1",
    positionId: "pos_treasurer",
    name: "Rishabh Upreti",
    rollNo: "25101120062",
    department: "B.Sc Nursing",
    year: "3rd Semester (2nd Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_treasurer_1"] || DEFAULT_AVATAR,
    manifesto: "Transparent student council fund management, financial reporting, and activity budget planning.",
    votes: 0
  },
  {
    id: "cand_treasurer_2",
    positionId: "pos_treasurer",
    name: "Mohmmed Aalim Khan",
    rollNo: "26961051",
    department: "B.Sc Nursing",
    year: "1st Semester (1st Year)",
    symbolName: "",
    symbolIcon: "",
    avatarUrl: candidatePhotos["cand_treasurer_2"] || DEFAULT_AVATAR,
    manifesto: "Fair fund allocation for student welfare events, transparent records, and accountability.",
    votes: 0
  }
];

const studentRoster = [
  {
    "studentId": "26962047",
    "name": "Aastha Khanka",
    "email": "AASTHAKHANKA.26962047@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26631022",
    "name": "Aditya Singh Deopa",
    "email": "ADITYASINGHDEOPA.26631022@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962007",
    "name": "Anmol Deep Kaur",
    "email": "ANMOLDEEPKAUR.26962007@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962035",
    "name": "Ashmeet Kaur",
    "email": "ASHMEETKAUR.26962035@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26632047",
    "name": "Astha Tiwari",
    "email": "ASTHATIWARI.26632047@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26032383",
    "name": "Avantika Vaishnavi Joshi",
    "email": "AVANTIKAVAISHNAVIJOSHI.26032383@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961021",
    "name": "Ayush Kumar",
    "email": "AYUSHKUMAR.26961021@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962053",
    "name": "Babli",
    "email": "BABLI.26962053@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962013",
    "name": "Bavreet Kaur Turna",
    "email": "BAVREETKAURTURNA.26962013@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962003",
    "name": "Bhumika",
    "email": "BHUMIKA.26962003@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962057",
    "name": "Bisakha Karki",
    "email": "BISAKHAKARKI.26962057@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961022",
    "name": "Chamatkar Kumar",
    "email": "CHAMATKARKUMAR.26961022@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962060",
    "name": "Chetana Rathour",
    "email": "CHETANARATHOUR.26962060@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962038",
    "name": "Chetna",
    "email": "CHETNA.26962038@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26631019",
    "name": "Chirag",
    "email": "CHIRAG.26631019@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962024",
    "name": "Deepika",
    "email": "DEEPIKA.26962024@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961039",
    "name": "Digvijay Singh",
    "email": "DIGVIJAYSINGH.26961039@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961011",
    "name": "Dilpreet Kaur",
    "email": "DILPREETKAUR.26961011@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26582146",
    "name": "Divya",
    "email": "DIVYA.26582146@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962061",
    "name": "Dorah Bagwasi",
    "email": "DORAHBAGWASI.26962061@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26632021",
    "name": "Harshita Joshi",
    "email": "HARSHITAJOSHI.26632021@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961043",
    "name": "Ishan",
    "email": "ISHAN.26961043@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962040",
    "name": "Jahanvi Rawat",
    "email": "JAHANVIRAWAT.26962040@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962028",
    "name": "Khushi",
    "email": "KHUSHI.26962028@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962027",
    "name": "Khushmeet Kaur",
    "email": "KHUSHMEETKAUR.26962027@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962034",
    "name": "Mahak Adhikari",
    "email": "MAHAKADHIKARI.26962034@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962041",
    "name": "Mahak Majoomdar",
    "email": "MAHAKMAJOOMDAR.26962041@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962042",
    "name": "Mehak Paladiya",
    "email": "MEHAKPALADIYA.26962042@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961052",
    "name": "Mohd Noorain",
    "email": "MOHDNOORAIN.26961052@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961051",
    "name": "Mohmmed Aalim Khan",
    "email": "MOHMMEDAALIMKHAN.26961051@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962009",
    "name": "Monika Masiwal",
    "email": "MONIKAMASIWAL.26962009@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962005",
    "name": "Naina Saun",
    "email": "NAINASAUN.26962005@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962029",
    "name": "Neeraj",
    "email": "NEERAJ.26962029@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962012",
    "name": "Nikita Agrawal",
    "email": "NIKITAAGRAWAL.26962012@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961063",
    "name": "Nitin",
    "email": "NITIN.26961063@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26632020",
    "name": "Pooja Arya",
    "email": "POOJAARYA.26632020@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961033",
    "name": "Pranav Singh Phoolbhati",
    "email": "PRANAVSINGHPHOOLBHATI.26961033@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26582161",
    "name": "Pratibha",
    "email": "PRATIBHA.26582161@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962032",
    "name": "Priyanka Adhikari",
    "email": "PRIYANKAADHIKARI.26962032@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962026",
    "name": "Riya Mer",
    "email": "RIYAMER.26962026@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962050",
    "name": "Ruhi",
    "email": "RUHI.26962050@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961010",
    "name": "Sachin Yadav",
    "email": "SACHINYADAV.26961010@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962018",
    "name": "Sahaj Kaur",
    "email": "SAHAJKAUR.26962018@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962058",
    "name": "Sandhya Giri",
    "email": "SANDHYAGIRI.26962058@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961048",
    "name": "Sarthak Pande",
    "email": "SARTHAKPANDE.26961048@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962015",
    "name": "Saufiya Kureshi",
    "email": "SAUFIYAKURESHI.26962015@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962020",
    "name": "Shalini Mehta",
    "email": "SHALINIMEHTA.26962020@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962019",
    "name": "Simran Chamyal",
    "email": "SIMRANCHAMYAL.26962019@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962023",
    "name": "Simranjeet Kaur Bajwa",
    "email": "SIMRANJEETKAURBAJWA.26962023@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962059",
    "name": "Sneha Saini Saini",
    "email": "SNEHASAINISAINI.26962059@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962054",
    "name": "Sonali Basnet",
    "email": "SONALIBASNET.26962054@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962044",
    "name": "Suchita Bhatt",
    "email": "SUCHITABHATT.26962044@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962008",
    "name": "Sugandha Hudiya Hudiya",
    "email": "SUGANDHAHUDIYAHUDIYA.26962008@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26632024",
    "name": "Teena Koranga",
    "email": "TEENAKORANGA.26632024@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962055",
    "name": "Uma Khinchal",
    "email": "UMAKHINCHAL.26962055@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961031",
    "name": "Vanshu",
    "email": "VANSHU.26961031@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961062",
    "name": "Vishal Tiwari",
    "email": "VISHALTIWARI.26961062@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961002",
    "name": "Yatharth Goswami",
    "email": "YATHARTHGOSWAMI.26961002@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961064",
    "name": "Gopal Dwivedi",
    "email": "GOPALDWIVEDI.26961064@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962066",
    "name": "Mansi Sarkar",
    "email": "MANSISARKAR.26962066@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26962065",
    "name": "Sifat Sidhu",
    "email": "SIFATSIDHU.26962065@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "26961067",
    "name": "Daniel Kabia Gathongo",
    "email": "DANIELKABIAGATHONGO.26961067@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "1st Year",
    "semester": "1st Semester"
  },
  {
    "studentId": "25101120021",
    "name": "Aksa Noor",
    "email": "AKSANOOR.25101120021@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120080",
    "name": "Akshat Gill",
    "email": "AKSHATGILL.25101120080@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120095",
    "name": "Alisha Hussain",
    "email": "ALISHAHUSSAIN.25101120095@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101128509",
    "name": "Ankit Kumar Mahto",
    "email": "ANKITKUMARMAHTO.25101128509@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120009",
    "name": "Ankit Singh Bisht",
    "email": "ANKITSINGHBISHT.25101120009@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120072",
    "name": "Ankita Pathak",
    "email": "ANKITAPATHAK.25101120072@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120068",
    "name": "Ashwani Verma",
    "email": "ASHWANIVERMA.25101120068@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120057",
    "name": "Ayush Chauhan",
    "email": "AYUSHCHAUHAN.25101120057@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120067",
    "name": "Bhumika Bawaree",
    "email": "BHUMIKABAWAREE.25101120067@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101124563",
    "name": "Chandani Rawat",
    "email": "CHANDANIRAWAT.25101124563@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120102",
    "name": "Deepika Bora",
    "email": "DEEPIKABORA.25101120102@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120092",
    "name": "Deepshikha",
    "email": "DEEPSHIKHA.25101120092@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120020",
    "name": "Dhairya Negi",
    "email": "DHAIRYANEGI.25101120020@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120069",
    "name": "Divyanshi Bhatt",
    "email": "DIVYANSHIBHATT.25101120069@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120397",
    "name": "Garima Supyal",
    "email": "GARIMASUPYAL.25101120397@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120356",
    "name": "Harshit Goswami",
    "email": "HARSHITGOSWAMI.25101120356@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120026",
    "name": "Harshit Nayal",
    "email": "HARSHITNAYAL.25101120026@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120056",
    "name": "Harshita Adhikari",
    "email": "HARSHITAADHIKARI.25101120056@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120047",
    "name": "Harshita Mishra",
    "email": "HARSHITAMISHRA.25101120047@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120104",
    "name": "Harshita Pandey",
    "email": "HARSHITAPANDEY.25101120104@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "2510120158",
    "name": "Janvi Samant",
    "email": "JANVISAMANT.2510120158@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101080264",
    "name": "Jashandeep Kaur",
    "email": "JASHANDEEPKAUR.25101080264@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120087",
    "name": "Jasraj Kaur",
    "email": "JASRAJKAUR.25101120087@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120093",
    "name": "Kanak Karki",
    "email": "KANAKKARKI.25101120093@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120050",
    "name": "Karan",
    "email": "KARAN.25101120050@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120077",
    "name": "Km. Priyanka Palariya",
    "email": "KMPRIYANKAPALARIYA.25101120077@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120064",
    "name": "Km. Himanshi",
    "email": "KMHIMANSHI.25101120064@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120612",
    "name": "Kusum Mehta",
    "email": "KUSUMMEHTA.25101120612@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120084",
    "name": "Lakshita Adhikari",
    "email": "LAKSHITAADHIKARI.25101120084@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120051",
    "name": "Mahi Danpali",
    "email": "MAHIDANPALI.25101120051@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25912001",
    "name": "Mercy Chidinma Iheanyichukwu",
    "email": "MERCYCHIDINMAIHEANYICHUKWU.25912001@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120088",
    "name": "Nancy Singh",
    "email": "NANCYSINGH.25101120088@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120074",
    "name": "Nirmala Bisht",
    "email": "NIRMALABISHT.25101120074@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120076",
    "name": "Nupur Bisht",
    "email": "NUPURBISHT.25101120076@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101124332",
    "name": "Palak Preet Kaur",
    "email": "PALAKPREETKAUR.25101124332@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120058",
    "name": "Pooja Bisht",
    "email": "POOJABISHT.25101120058@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120071",
    "name": "Prakshi",
    "email": "PRAKSHI.25101120071@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120032",
    "name": "Prerna Kandpal",
    "email": "PRERNAKANDPAL.25101120032@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120109",
    "name": "Priyanka Bora",
    "email": "PRIYANKABORA.25101120109@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120099",
    "name": "Rashi",
    "email": "RASHI.25101120099@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120025",
    "name": "Rashi Dhaila",
    "email": "RASHIDHAILA.25101120025@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101124658",
    "name": "Rashmi Rana",
    "email": "RASHMIRANA.25101124658@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120049",
    "name": "Rashmi",
    "email": "RASHMI.25101120049@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120060",
    "name": "Renu Joshi",
    "email": "RENUJOSHI.25101120060@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120062",
    "name": "Rishabh Upreti",
    "email": "RISHABHUPRETI.25101120062@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120053",
    "name": "Riya Khatri",
    "email": "RIYAKHATRI.25101120053@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120094",
    "name": "Sakshi Bhatt",
    "email": "SAKSHIBHATT.25101120094@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120096",
    "name": "Sakshi Rawat",
    "email": "SAKSHIRAWAT.25101120096@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120029",
    "name": "Sarika Sahai",
    "email": "SARIKASAHAI.25101120029@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120090",
    "name": "Shreya Chuphal",
    "email": "SHREYACHUPHAL.25101120090@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120073",
    "name": "Shreya Gurung",
    "email": "SHREYAGURUNG.25101120073@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120086",
    "name": "Sidra Bee",
    "email": "SIDRABEE.25101120086@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101128620",
    "name": "Siya Chand",
    "email": "SIYACHAND.25101128620@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120103",
    "name": "Stuti Prashansa Singh",
    "email": "STUTIPRASHANSASINGH.25101120103@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120079",
    "name": "Tarun Garbyal",
    "email": "TARUNGARBYAL.25101120079@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120100",
    "name": "Tina Mandal",
    "email": "TINAMANDAL.25101120100@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120054",
    "name": "Vaishali Bhatt",
    "email": "VAISHALIBHATT.25101120054@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101127359",
    "name": "Vaishnavi Pandey",
    "email": "VAISHNAVIPANDEY.25101127359@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25101120048",
    "name": "Yasir Asrar",
    "email": "YASIRASRAR.25101120048@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25962001",
    "name": "Tadiwanashe Yolanda Tayengwa",
    "email": "TADIWANASHEYOLANDATAYENGWA.25962001@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25961003",
    "name": "Ezaldeenismailomer Sharf Aldeen",
    "email": "EZALDEENISMAILOMERSHARFALDEEN.25961003@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25962004",
    "name": "Dulagi Ferede Beyene Aga",
    "email": "DULAGIFEREDEBEYENEAGA.25962004@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25962005",
    "name": "Lindah Makandi",
    "email": "LINDAHMAKANDI.25962005@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "25962006",
    "name": "Eunice Nsien Enoobong",
    "email": "EUNICENSIENENOOBONG.25962006@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "2nd Year",
    "semester": "3rd Semester"
  },
  {
    "studentId": "23962049",
    "name": "Aastha Pandey",
    "email": "AASTHAPANDEY.23962049@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962016",
    "name": "Akansha Tamta",
    "email": "AKANSHATAMTA.23962016@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962055",
    "name": "Akshita Arya",
    "email": "AKSHITAARYA.23962055@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961007",
    "name": "Aman Raj",
    "email": "AMANRAJ.23961007@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961013",
    "name": "Aman Raj",
    "email": "AMANRAJ.23961013@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962039",
    "name": "Anjali Mehta",
    "email": "ANJALIMEHTA.23962039@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962011",
    "name": "Anju Arya",
    "email": "ANJUARYA.23962011@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961054",
    "name": "Aradhay Kashyap",
    "email": "ARADHAYKASHYAP..23961054@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962001",
    "name": "Atul Kumar",
    "email": "ATULKUMAR.23961001@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962059",
    "name": "Banshika Chauhan",
    "email": "BANSHIKACHAUHAN.23962059@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962051",
    "name": "Bhawana Negi",
    "email": "BHAWANANEGI.23962051@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962062",
    "name": "Bhoomika Chandra",
    "email": "BHOOMIKACHANDRA.23962062@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962043",
    "name": "Deeksha Rawat",
    "email": "DEEKSHARAWAT23962043@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962033",
    "name": "Diksha Bagari",
    "email": "DIKSHABAGARI.23962033@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962042",
    "name": "Diksha Mahara",
    "email": "DIKSHAMAHARA.23962042@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962064",
    "name": "Diksha Negi",
    "email": "DIKSHANEGI.23962064@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962037",
    "name": "Dilpreet Kaur Toor",
    "email": "Dilpreetkaurtoor.23962037@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "239622070",
    "name": "Disha Karki",
    "email": "DISHAKARKI.239622070@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962048",
    "name": "Divyanshi Bisht",
    "email": "DIVYANSHIBISHT.23962048@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962047",
    "name": "Divyanshi Dangi",
    "email": "DIVYANSHIDANGI.23962047@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962003",
    "name": "Divyanshi Suyal",
    "email": "divyanshisuyal.23962003@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962045",
    "name": "Diya Chand",
    "email": "DIYACHAND.23962045@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "239622075",
    "name": "Diya Negi",
    "email": "DIYANEGI.239622075@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962019",
    "name": "Gauri Karki",
    "email": "Gaurikarki.23962019@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "239622072",
    "name": "Harshita Pandey",
    "email": "HARSHITAPANDEY.239622072@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23582038",
    "name": "Janhvi Singh",
    "email": "janhvisingh.23582038@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23631037",
    "name": "Jay Kumar",
    "email": "JAYKUMAR.23631037@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962053",
    "name": "Kamna Negi",
    "email": "KAMNANEGI.23962053@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "239622076",
    "name": "Kaviyanjali Arya",
    "email": "KAVIYANJALIARYA.239622076@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962008",
    "name": "Khushi Rathour",
    "email": "KHUSHIRATHOUR.23962008@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962018",
    "name": "Lakshmi",
    "email": "LAXMI.23962018@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962036",
    "name": "Lovely Rana",
    "email": "LOVLYRANA23962036@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962040",
    "name": "Mamta Mandal",
    "email": "MAMTAMANDAL.23962040@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961061",
    "name": "Manish Kumar",
    "email": "MANISHKUMAR.23961061@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "239622071",
    "name": "Megha Bora",
    "email": "MEGHABORA.239622071@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961017",
    "name": "Neeraj Bhatt",
    "email": "neerajbhatt2466@gmail.com",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962002",
    "name": "Neha Pandey",
    "email": "NehaPandey.23962002@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962004",
    "name": "Nirmala Tamta",
    "email": "NIRMALATAMTA.23962004@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962032",
    "name": "Nisha Kumari",
    "email": "NISHAKUMARI.23962032@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961005",
    "name": "Prabhat Ranjan",
    "email": "PRABHATRANJAN.23961005@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962012",
    "name": "Preeti Bohra",
    "email": "PREETIBOHRA.23962012@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962038",
    "name": "Priyanka Kohli",
    "email": "PRIYANKA.23962038@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962009",
    "name": "Priyanka Pandey",
    "email": "PRIYANKAPANDEY.23962009@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961027",
    "name": "Rahul Kumar",
    "email": "RAHULKUMAR.23961027@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961052",
    "name": "Rahul Kumar",
    "email": "RAHULKUMAR.23961052@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962065",
    "name": "Reetika Kandpal",
    "email": "REETIKAKANDPAL.23962065@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961029",
    "name": "Sachin Kumar Arya",
    "email": "SACHINARYA.23961029@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962026",
    "name": "Sakshi Kumari",
    "email": "SAKSHIKUMARI.23962026@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962028",
    "name": "Tanishka Bhatt",
    "email": "TANISHKABHATT.23962028@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962067",
    "name": "Tanuja Mehra",
    "email": "TANUJAMEHRA.23962067@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23962057",
    "name": "Yamini Tiwari",
    "email": "YAMINITIWARI.23962057@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23831013",
    "name": "Yash Aitwal",
    "email": "yashaitwal.23831013@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "23961058",
    "name": "Yash Bora",
    "email": "Yashbora.23961058@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "4th Year",
    "semester": "7th Semester"
  },
  {
    "studentId": "24962024",
    "name": "Amarjot Kaur",
    "email": "AMARJOTKAUR.24962024@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962047",
    "name": "Anjali Jha",
    "email": "ANJALIJHA.24962047@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962055",
    "name": "Anjali Khati",
    "email": "ANJALIKHATI.24962055@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962048",
    "name": "Anshika Sharma",
    "email": "ANSHIKASHARMA.24962048@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962005",
    "name": "Deepti Verma",
    "email": "DEEPTIVERMA.24962005@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962027",
    "name": "Dhani Sanklan",
    "email": "DHANISANKLAN.24962027@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962049",
    "name": "Divya Bhakuni",
    "email": "DIVYABHAKUNI.24962049@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962075",
    "name": "Himanshi",
    "email": "HIMANSHI.24962075@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962003",
    "name": "Priyanka Goswami",
    "email": "PRIYANKAGOSWAMI.24962003@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24631013",
    "name": "Rohit Raj Ranjan",
    "email": "ROHITRAJRANJAN.24631013@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962065",
    "name": "Sanjana Chauhan",
    "email": "SANJANACHAUHAN.24962065@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962080",
    "name": "Tanushri",
    "email": "TANUSHRI.24962080@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961035",
    "name": "Akash Goswami",
    "email": "AKASHGOSWAMI.24961035@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962070",
    "name": "Arshpreet Kaur",
    "email": "ARSHPREETKAUR.24962070@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962009",
    "name": "Deepa Bajeli",
    "email": "DEEPABAJELI.24962009@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962072",
    "name": "Diya Bisht",
    "email": "DIYABISHT.24962072@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961028",
    "name": "Harsh Chand",
    "email": "HARSHCHAND.24961028@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "241081002",
    "name": "Harshit Kumar",
    "email": "HARSHITKUMAR.241081002@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961056",
    "name": "Hemant Priyadarshi",
    "email": "HEMANTPRIYADARSHI.24961056@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962004",
    "name": "Himani Tolia",
    "email": "HIMANITOLIA.24962004@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961069",
    "name": "Kartik Prakash",
    "email": "KARTIKPRAKASH.24961069@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962060",
    "name": "Karuna Priscilla",
    "email": "KARUNAPRISCILLA.24962060@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962058",
    "name": "Khushi Sunar",
    "email": "KHUSHISUNAR.24962058@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962019",
    "name": "Komal Arya",
    "email": "KOMALARYA.24962019@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962059",
    "name": "Mahak Bisht",
    "email": "MAHAKBISHT.24962059@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961079",
    "name": "Mayank Bisht",
    "email": "MAYANKBISHT.24961079@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961008",
    "name": "Md Sadab Khan",
    "email": "MDSADABKHAN.24961008@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961063",
    "name": "Md Sameer Shah",
    "email": "MDSAMEERSHAH.24961063@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962062",
    "name": "Mitali Bisht",
    "email": "MITALIBISHT.24962062@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962043",
    "name": "Monika Rawat",
    "email": "MONIKARAWAT.24962043@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961077",
    "name": "Mosahid Raza",
    "email": "MOSAHIDRAZA.24961077@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962006",
    "name": "Muskan",
    "email": "MUSKAN.24962006@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962038",
    "name": "Neema Barti",
    "email": "NEEMABARTI.24962038@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962020",
    "name": "Neeta Bargali",
    "email": "NEETABARGALI.24962020@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24472001",
    "name": "Palak Pandey",
    "email": "PALAKPANDEY.24472001@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962046",
    "name": "Pragati R Lal",
    "email": "PRAGATIRLAL.24962046@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962053",
    "name": "Priyanshi",
    "email": "PRIYANSHI.24962053@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962032",
    "name": "Ridhim Chaudhary",
    "email": "RIDHIMCHAUDHARY.24962032@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962045",
    "name": "Sagar Painwal",
    "email": "SAGARPAINWAL.24962045@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962023",
    "name": "Salina",
    "email": "SALINA.24962023@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962065-PG",
    "name": "Shiwani Bhandari",
    "email": "SHIWANIBHANDARI.24962065-PG@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24631147",
    "name": "Vinita",
    "email": "VINITA.24631147@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961050",
    "name": "Vivek Kumar",
    "email": "VIVEKKUMAR.24961050@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962039",
    "name": "Harshita Mehta",
    "email": "HARSHITAMEHTA.24962039@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962021",
    "name": "Himani Rawat",
    "email": "HIMANIRAWAT.24962021@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962064",
    "name": "Karnika Koranga",
    "email": "KARNIKAKORANGA.24962064@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961036",
    "name": "Mayank Kumar Arya",
    "email": "MAYANKKUMARARYA.24961036@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962033",
    "name": "Niharika Kandpal",
    "email": "NIHARIKAKANDPAL.24962033@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962025",
    "name": "Palak Yadav",
    "email": "PALAKYADAV.24962025@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962007",
    "name": "Priyanshi Joshi",
    "email": "PRIYANSHIJOSHI.24962007@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24961076",
    "name": "Tanuj Puri",
    "email": "TANUJPURI.24961076@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962042",
    "name": "Pushpa Bisht",
    "email": "PUSHPABISHT.24962042@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962018",
    "name": "Soumya Dev",
    "email": "SOUMYADEV.24962018@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  },
  {
    "studentId": "24962078",
    "name": "Tanisha Joshi",
    "email": "TANISHAJOSHI.24962078@gehu.ac.in",
    "course": "B.Sc Nursing",
    "department": "B.Sc Nursing",
    "year": "3rd Year",
    "semester": "5th Semester"
  }
];

export const initialVoters = studentRoster.map((stu, idx) => ({
  studentId: stu.studentId,
  name: stu.name,
  fatherName: "N/A",
  course: "B.Sc Nursing",
  department: "B.Sc Nursing",
  year: stu.year || "4th Year",
  semester: stu.semester || "7th Semester",
  email: stu.email,
  photoUrl: DEFAULT_AVATAR,
  hasVoted: false,
  votedAt: null,
  authorizedAt: null
}));

export const initialBallots = []; // Clean state: 0 pre-cast votes so user can test manually!

export const initialAuditLogs = [
  {
    id: "log_init_01",
    timestamp: "2026-10-08T04:00:00Z",
    action: "ELECTION_INITIALIZED",
    actor: "Chief Electoral Officer (Admin)",
    details: "Election configuration locked. 233 registered students of B.Sc Nursing (1st, 3rd, 5th, and 7th Semesters) loaded into secure ledger with 0 votes polled."
  },
  {
    id: "log_init_02",
    timestamp: "2026-10-08T04:15:00Z",
    action: "STATION_SECURITY_ACTIVE",
    actor: "System Security Engine",
    details: "Role-based authentication initialized. EVM terminal and Verification desk primed for official polling."
  }
];
