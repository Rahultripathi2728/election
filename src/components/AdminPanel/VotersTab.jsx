import React, { useState } from "react";
import { 
  UserPlus, 
  Upload, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X, 
  Download, 
  RotateCcw, 
  FileSpreadsheet,
  GraduationCap
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80"
];

export const VotersTab = () => {
  const { voters, addVoter, updateVoter, deleteVoter, importVotersBulk } = useElection();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL | ELIGIBLE | VOTED
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Single Voter Form state
  const [stuId, setStuId] = useState("");
  const [stuName, setStuName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [course, setCourse] = useState("B.Tech Computer Science");
  const [semester, setSemester] = useState("6th Semester");
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_AVATARS[0]);
  const [formError, setFormError] = useState("");

  // Bulk CSV Import text state
  const [csvText, setCsvText] = useState("");
  const [importSummary, setImportSummary] = useState(null);

  // Filtering
  const filteredVoters = voters.filter((v) => {
    const matchesSearch = 
      v.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.course?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "ELIGIBLE") return !v.hasVoted;
    if (filterStatus === "VOTED") return v.hasVoted;
    return true;
  });

  const totalCount = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const eligibleCount = totalCount - votedCount;

  const handleOpenAdd = () => {
    setStuId(`STU-2024-${String(voters.length + 1).padStart(3, "0")}`);
    setStuName("");
    setFatherName("");
    setCourse("B.Tech Computer Science");
    setSemester("6th Semester");
    setPhotoUrl(SAMPLE_AVATARS[Math.floor(Math.random() * SAMPLE_AVATARS.length)]);
    setFormError("");
    setShowAddModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const res = addVoter({
      studentId: stuId.trim(),
      name: stuName.trim(),
      fatherName: fatherName.trim(),
      course: course.trim(),
      semester: semester.trim(),
      photoUrl
    });

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setShowAddModal(false);
  };

  const handleProcessCsv = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split("\n");
    const parsed = [];

    // Format expected: StudentID, Name, FatherName, Course, Semester
    lines.forEach((line) => {
      const parts = line.split(",").map((s) => s.trim());
      if (parts.length >= 2 && !parts[0].toLowerCase().includes("studentid")) {
        parsed.push({
          studentId: parts[0],
          name: parts[1],
          fatherName: parts[2] || "N/A",
          course: parts[3] || "B.Tech General",
          semester: parts[4] || "1st Semester"
        });
      }
    });

    if (parsed.length === 0) {
      setImportSummary({ error: "Could not parse any valid voter rows. Check CSV format." });
      return;
    }

    const count = importVotersBulk(parsed);
    setImportSummary({ success: `Successfully imported ${count} eligible student voters!` });
    setTimeout(() => {
      setShowImportModal(false);
      setImportSummary(null);
      setCsvText("");
    }, 1500);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = 
      "data:text/csv;charset=utf-8," +
      "StudentID,StudentName,FatherName,Course,Semester\n" +
      "STU-2024-101,Rahul Malhotra,Sunil Malhotra,B.Tech CSE,6th Semester\n" +
      "STU-2024-102,Pooja Hegde,Prakash Hegde,B.Tech ECE,4th Semester\n" +
      "STU-2024-103,Nikhil Srivastava,Vijay Srivastava,B.Tech IT,6th Semester\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_electoral_roll.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-subtab-container fade-in">
      {/* Subtab Header */}
      <div className="subtab-header">
        <div>
          <h2 className="subtab-title">Electoral Roll & Voter Registry</h2>
          <p className="subtab-desc">
            Pre-registered database of eligible student voters with Student ID, Name, Father's Name, Course, and Semester.
          </p>
        </div>
        <div className="subtab-header-actions">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary">
            <Upload size={16} />
            <span>Bulk CSV Import</span>
          </button>
          <button onClick={handleOpenAdd} className="btn-primary">
            <UserPlus size={16} />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="voter-metric-strip">
        <div className="voter-metric-box">
          <span className="v-metric-label">Total Registered</span>
          <span className="v-metric-val">{totalCount}</span>
        </div>
        <div className="voter-metric-box metric-success">
          <span className="v-metric-label">Eligible to Vote</span>
          <span className="v-metric-val">{eligibleCount}</span>
        </div>
        <div className="voter-metric-box metric-blue">
          <span className="v-metric-label">Ballots Cast</span>
          <span className="v-metric-val">{votedCount}</span>
        </div>
        <div className="voter-metric-box metric-amber">
          <span className="v-metric-label">Turnout</span>
          <span className="v-metric-val">
            {totalCount > 0 ? Math.round((votedCount / totalCount) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-row">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Student ID, Name, Father's Name, or Course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="search-clear-btn">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-pill-group">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`filter-pill ${filterStatus === "ALL" ? "active" : ""}`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus("ELIGIBLE")}
            className={`filter-pill ${filterStatus === "ELIGIBLE" ? "active" : ""}`}
          >
            Eligible ({eligibleCount})
          </button>
          <button
            onClick={() => setFilterStatus("VOTED")}
            className={`filter-pill ${filterStatus === "VOTED" ? "active" : ""}`}
          >
            Voted ({votedCount})
          </button>
        </div>
      </div>

      {/* Voters Table */}
      <div className="table-responsive card-base">
        <table className="voter-table">
          <thead>
            <tr>
              <th>Voter / Student</th>
              <th>Student ID</th>
              <th>Father's Name</th>
              <th>Course & Semester</th>
              <th>Electoral Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVoters.map((voter) => (
              <tr key={voter.studentId} className={voter.hasVoted ? "row-voted" : ""}>
                {/* Profile */}
                <td>
                  <div className="voter-cell-profile">
                    <img
                      src={voter.photoUrl}
                      alt={voter.name}
                      className="voter-avatar-img"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div>
                      <div className="voter-name">{voter.name}</div>
                      <div className="voter-sub">{voter.course}</div>
                    </div>
                  </div>
                </td>

                {/* Student ID */}
                <td>
                  <span className="voter-id-code">{voter.studentId}</span>
                </td>

                {/* Father's Name */}
                <td className="text-muted">
                  {voter.fatherName || "N/A"}
                </td>

                {/* Course & Semester */}
                <td>
                  <div className="course-text">
                    <GraduationCap size={13} /> {voter.semester}
                  </div>
                </td>

                {/* Status */}
                <td>
                  {voter.hasVoted ? (
                    <span className="badge badge-danger" title={`Voted at ${voter.votedAt || "Earlier"}`}>
                      <CheckCircle2 size={12} /> Already Voted
                    </span>
                  ) : (
                    <span className="badge badge-success">
                      Eligible to Vote
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="text-right">
                  <div className="row-actions">
                    {/* Reset voting status toggle */}
                    {voter.hasVoted && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Reset voting status for ${voter.name} back to Eligible?`)) {
                            updateVoter(voter.studentId, { hasVoted: false, votedAt: null });
                          }
                        }}
                        className="btn-icon-subtle"
                        title="Reset Status to Eligible (Testing)"
                      >
                        <RotateCcw size={15} color="#d97706" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove student ${voter.name} from electoral roll?`)) {
                          deleteVoter(voter.studentId);
                        }
                      }}
                      className="btn-icon-subtle btn-delete-hover"
                      title="Remove Voter"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredVoters.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center empty-table-cell">
                  No matching student records found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Single Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge">
                  <UserPlus size={20} color="#2563eb" />
                </div>
                <div>
                  <h3>Register Eligible Voter</h3>
                  <p>Add an individual student to the pre-authorized election roster</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert-box alert-error">
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="modal-form-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Student ID / Roll No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-2024-045"
                    value={stuId}
                    onChange={(e) => setStuId(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={stuName}
                    onChange={(e) => setStuName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Father's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Course / Program *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Semester / Year *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="form-select"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Student Photo / ID Card Photograph</label>
                  <div className="photo-input-group">
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="form-input"
                    />
                    <img src={photoUrl} alt="Preview" className="photo-thumb" />
                  </div>
                  <div className="photo-presets-row">
                    <span className="photo-preset-label">Sample Photos:</span>
                    {SAMPLE_AVATARS.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setPhotoUrl(url)}
                        className={`avatar-preset-btn ${photoUrl === url ? "active" : ""}`}
                      >
                        <img src={url} alt={`Avatar ${idx}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Register Voter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge">
                  <FileSpreadsheet size={20} color="#2563eb" />
                </div>
                <div>
                  <h3>Bulk Import Electoral Roll</h3>
                  <p>Paste comma-separated rows or upload CSV of registered students</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-pad">
              <div className="csv-guide-strip">
                <div>Format: <code>StudentID, StudentName, FatherName, Course, Semester</code></div>
                <button onClick={handleDownloadSampleCsv} className="btn-text-action">
                  <Download size={14} /> Download Sample CSV
                </button>
              </div>

              {importSummary && (
                <div className={`alert-box ${importSummary.error ? "alert-error" : "alert-success"}`}>
                  <span>{importSummary.error || importSummary.success}</span>
                </div>
              )}

              <div className="form-group">
                <label>Paste CSV Rows Below:</label>
                <textarea
                  rows={8}
                  placeholder={`STU-2024-051, Rohan Joshi, Prakash Joshi, B.Tech IT, 6th Semester\nSTU-2024-052, Megha Singhania, Vinay Singhania, B.Tech CSE, 4th Semester`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="form-input form-mono"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleProcessCsv} className="btn-primary">
                  <Upload size={16} /> Import Voters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
