// Default initial election dataset
export const initialElectionConfig = {
  title: "University Student Council Elections 2026",
  institution: "State Institute of Science & Technology",
  electionId: "ELEC-2026-MAIN",
  status: "ACTIVE", // "SETUP" | "ACTIVE" | "PAUSED" | "CONCLUDED"
  allowNota: true,
  autoLockDelaySeconds: 4,
  boothState: {
    status: "LOCKED", // "LOCKED" | "UNLOCKED" | "SUBMITTING"
    authorizedVoter: null, // { studentId, name, course, semester, fatherName, photoUrl }
    authorizedAt: null,
    activeBoothId: "BOOTH-ALPHA-01"
  }
};

export const initialPositions = [
  {
    id: "pos_pres",
    title: "President",
    description: "Chief Executive Representative of the Student Body",
    sequence: 1,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE"
  },
  {
    id: "pos_vp",
    title: "Vice President",
    description: "Academic Affairs & Inter-Departmental Coordinator",
    sequence: 2,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE"
  },
  {
    id: "pos_gs",
    title: "General Secretary",
    description: "Administrative Liaison & Student Welfare Coordinator",
    sequence: 3,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE"
  },
  {
    id: "pos_cult_sports",
    title: "Cultural & Sports Secretary",
    description: "Festival Director & University Athletics In-Charge",
    sequence: 4,
    minSelections: 1,
    maxSelections: 1,
    status: "ACTIVE"
  }
];

export const initialCandidates = [
  // President
  {
    id: "cand_pres_1",
    positionId: "pos_pres",
    name: "Aarav Sharma",
    rollNo: "CS-2022-014",
    department: "Computer Science & Eng.",
    year: "4th Year",
    symbolName: "Soaring Eagle",
    symbolIcon: "🦅",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    manifesto: "Transparent funding, 24/7 digital campus library, improved placement cell outreach.",
    votes: 18
  },
  {
    id: "cand_pres_2",
    positionId: "pos_pres",
    name: "Ananya Deshmukh",
    rollNo: "EC-2022-088",
    department: "Electronics & Communication",
    year: "4th Year",
    symbolName: "Guiding Star",
    symbolIcon: "🌟",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    manifesto: "Empowering student entrepreneurship, campus-wide smart Wi-Fi upgrade, mental health resources.",
    votes: 24
  },

  // Vice President
  {
    id: "cand_vp_1",
    positionId: "pos_vp",
    name: "Rohan Kulkarni",
    rollNo: "ME-2023-042",
    department: "Mechanical Engineering",
    year: "3rd Year",
    symbolName: "Falcon Rocket",
    symbolIcon: "🚀",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    manifesto: "Modern lab equipment modernization, technical club sponsorship, internship fairs.",
    votes: 21
  },
  {
    id: "cand_vp_2",
    positionId: "pos_vp",
    name: "Priya Patel",
    rollNo: "IT-2023-019",
    department: "Information Technology",
    year: "3rd Year",
    symbolName: "Courageous Lion",
    symbolIcon: "🦁",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    manifesto: "Open academic grievance redressal, cafeteria food hygiene audit, industry mentoring.",
    votes: 20
  },

  // General Secretary
  {
    id: "cand_gs_1",
    positionId: "pos_gs",
    name: "Vikramaditya Rathore",
    rollNo: "EE-2022-033",
    department: "Electrical Engineering",
    year: "4th Year",
    symbolName: "Lightning Torch",
    symbolIcon: "⚡",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    manifesto: "Streamlined event permissions, paperless campus administrative approvals.",
    votes: 19
  },
  {
    id: "cand_gs_2",
    positionId: "pos_gs",
    name: "Sneha Nair",
    rollNo: "BT-2023-011",
    department: "Biotechnology",
    year: "3rd Year",
    symbolName: "Green Branch",
    symbolIcon: "🌿",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    manifesto: "Eco-friendly campus initiatives, solar lighting on walkways, student bus transit expansion.",
    votes: 22
  },

  // Cultural & Sports Secretary
  {
    id: "cand_cult_1",
    positionId: "pos_cult_sports",
    name: "Kabir Sen",
    rollNo: "CE-2023-055",
    department: "Civil Engineering",
    year: "3rd Year",
    symbolName: "Electric Guitar",
    symbolIcon: "🎸",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    manifesto: "Bigger inter-college cultural fest budget, musical instrument rental room.",
    votes: 25
  },
  {
    id: "cand_cult_2",
    positionId: "pos_cult_sports",
    name: "Ishita Bhattacharya",
    rollNo: "CS-2023-090",
    department: "Computer Science & Eng.",
    year: "3rd Year",
    symbolName: "Golden Trophy",
    symbolIcon: "🏆",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    manifesto: "All-weather indoor badminton & table tennis arena, sports scholarship program.",
    votes: 16
  }
];

export const initialVoters = [
  {
    studentId: "STU-2024-001",
    name: "Devendra Rajput",
    fatherName: "Ramesh Rajput",
    course: "B.Tech Computer Science",
    semester: "6th Semester",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80",
    hasVoted: false,
    votedAt: null,
    authorizedAt: null
  },
  {
    studentId: "STU-2024-002",
    name: "Meera Kapoor",
    fatherName: "Rajesh Kapoor",
    course: "B.Tech Electronics & Comm.",
    semester: "4th Semester",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    hasVoted: false,
    votedAt: null,
    authorizedAt: null
  },
  {
    studentId: "STU-2024-003",
    name: "Aditya Verma",
    fatherName: "Suresh Verma",
    course: "B.Tech Information Tech.",
    semester: "6th Semester",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    hasVoted: true,
    votedAt: "2026-10-04T10:14:22Z",
    authorizedAt: "2026-10-04T10:13:05Z"
  },
  {
    studentId: "STU-2024-004",
    name: "Tanvi Joshi",
    fatherName: "Alok Joshi",
    course: "B.Tech Mechanical Eng.",
    semester: "8th Semester",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80",
    hasVoted: true,
    votedAt: "2026-10-04T10:28:10Z",
    authorizedAt: "2026-10-04T10:26:45Z"
  },
  {
    studentId: "STU-2024-005",
    name: "Harshit Saxena",
    fatherName: "Vinod Saxena",
    course: "B.Tech Electrical Eng.",
    semester: "4th Semester",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
    hasVoted: false,
    votedAt: null,
    authorizedAt: null
  },
  {
    studentId: "STU-2024-006",
    name: "Shruti Mishra",
    fatherName: "Dr. R.K. Mishra",
    course: "B.Tech Civil Engineering",
    semester: "6th Semester",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80",
    hasVoted: false,
    votedAt: null,
    authorizedAt: null
  },
  {
    studentId: "STU-2024-007",
    name: "Kunal Singhania",
    fatherName: "Ashok Singhania",
    course: "B.Tech Biotechnology",
    semester: "4th Semester",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80",
    hasVoted: false,
    votedAt: null,
    authorizedAt: null
  },
  {
    studentId: "STU-2024-008",
    name: "Anamika Roy",
    fatherName: "Subhash Roy",
    course: "B.Tech Computer Science",
    semester: "2nd Semester",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80",
    hasVoted: false,
    votedAt: null,
    authorizedAt: null
  },
  {
    studentId: "STU-2024-009",
    name: "Ayush Malhotra",
    fatherName: "Sunil Malhotra",
    course: "B.Tech Electronics & Comm.",
    semester: "8th Semester",
    photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80",
    hasVoted: false,
    votedAt: null,
    authorizedAt: null
  },
  {
    studentId: "STU-2024-010",
    name: "Ritu Chouhan",
    fatherName: "Mahendra Chouhan",
    course: "B.Tech Information Tech.",
    semester: "6th Semester",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
    hasVoted: false,
    votedAt: null,
    authorizedAt: null
  }
];

export const initialAuditLogs = [
  {
    id: "log_init_01",
    timestamp: "2026-10-04T09:00:00Z",
    action: "ELECTION_INITIALIZED",
    actor: "Chief Electoral Officer (Admin)",
    details: "Election configuration locked. 4 positions, 8 candidates, 10 registered voters loaded."
  },
  {
    id: "log_init_02",
    timestamp: "2026-10-04T10:13:05Z",
    action: "VOTER_AUTHORIZED",
    actor: "Verification Desk #1",
    details: "Voter Aditya Verma (STU-2024-003) authorized for EVM Booth Alpha-01"
  },
  {
    id: "log_init_03",
    timestamp: "2026-10-04T10:14:22Z",
    action: "BALLOT_RECORDED",
    actor: "EVM Terminal Booth Alpha-01",
    details: "Official ballot #001 recorded. EVM auto-locked."
  },
  {
    id: "log_init_04",
    timestamp: "2026-10-04T10:26:45Z",
    action: "VOTER_AUTHORIZED",
    actor: "Verification Desk #1",
    details: "Voter Tanvi Joshi (STU-2024-004) authorized for EVM Booth Alpha-01"
  },
  {
    id: "log_init_05",
    timestamp: "2026-10-04T10:28:10Z",
    action: "BALLOT_RECORDED",
    actor: "EVM Terminal Booth Alpha-01",
    details: "Official ballot #002 recorded. EVM auto-locked."
  }
];
