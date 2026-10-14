import React, { useState, useRef } from "react";
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
  GraduationCap,
  FolderOpen
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { DEFAULT_AVATAR } from "../../utils/constants";
import { compressImageFile } from "../../utils/imageCompressor";
import { Modal } from "../common/Modal";

export const VotersTab = () => {
  const { voters, addVoter, updateVoter, deleteVoter, importVotersBulk } = useElection();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL | ELIGIBLE | VOTED
  const [filterYear, setFilterYear] = useState("ALL"); // ALL | 1st Year | 2nd Year | 3rd Year | 4th Year
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Single Voter Form state
  const [stuId, setStuId] = useState("");
  const [stuName, setStuName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [course, setCourse] = useState("B.Tech Computer Science");
  const [year, setYear] = useState("1st Year");
  const [semester, setSemester] = useState("1st Semester");
  const [photoUrl, setPhotoUrl] = useState(DEFAULT_AVATAR);
  const [formError, setFormError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const voterFileInputRef = useRef(null);

  // Bulk CSV Import text state
  const [csvText, setCsvText] = useState("");
  const [importSummary, setImportSummary] = useState(null);

  // Filtering
  const filteredVoters = voters.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      v.studentId.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.fatherName?.toLowerCase().includes(q) ||
      v.course?.toLowerCase().includes(q) ||
      v.department?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterStatus === "ELIGIBLE" && v.hasVoted) return false;
    if (filterStatus === "VOTED" && !v.hasVoted) return false;

    if (filterYear !== "ALL" && v.year !== filterYear) return false;

    return true;
  });

  const totalCount = voters.length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const eligibleCount = totalCount - votedCount;

  const handleOpenAdd = () => {
    setStuId(`2396${String(2000 + voters.length + 1)}`);
    setStuName("");
    setFatherName("");
    setCourse("B.Sc Nursing");
    setYear("1st Year");
    setSemester("1st Semester");
    setPhotoUrl(DEFAULT_AVATAR);
    setUploadedFileName("");
    setFormError("");
    setShowAddModal(true);
  };

  const processVoterImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }
    setUploadedFileName(`Optimizing ${file.name}...`);
    try {
      const compressedDataUrl = await compressImageFile(file, 240, 0.82);
      setPhotoUrl(compressedDataUrl);
      setUploadedFileName(`${file.name} (Cloud-optimized, ~15 KB)`);
    } catch (err) {
      console.warn("Voter photo compression error:", err);
      setPhotoUrl(DEFAULT_AVATAR);
    }
  };

  const handleVoterDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processVoterImageFile(file);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const res = addVoter({
      studentId: stuId.trim(),
      name: stuName.trim(),
      fatherName: fatherName.trim(),
      course: course.trim(),
      year: year,
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

    // Format expected: StudentID, Name, FatherName, Course, Semester, Year
    lines.forEach((line) => {
      const parts = line.split(",").map((s) => s.trim());
      if (parts.length >= 2 && !parts[0].toLowerCase().includes("studentid")) {
        parsed.push({
          studentId: parts[0],
          name: parts[1],
          fatherName: parts[2] || "N/A",
          course: parts[3] || "B.Tech General",
          semester: parts[4] || "1st Semester",
          year: parts[5] || "1st Year"
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
      "StudentID,StudentName,FatherName,Course,Semester,AcademicYear\n" +
      "STU-2026-Y1-101,Rahul Malhotra,Sunil Malhotra,B.Tech CSE,1st Semester,1st Year\n" +
      "STU-2025-Y2-102,Pooja Hegde,Prakash Hegde,B.Tech ECE,3rd Semester,2nd Year\n" +
      "STU-2024-Y3-103,Nikhil Srivastava,Vijay Srivastava,B.Tech IT,5th Semester,3rd Year\n" +
      "STU-2023-Y4-104,Ananya Sen,Manoj Sen,B.Tech ME,7th Semester,4th Year\n";
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
            Complete database of eligible student voters across 1st to 4th Year with biometric photos and verification statuses.
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
          <span className="v-metric-label">Turnout Rate</span>
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
            placeholder="Search by Student ID, Name, Father's Name, or Branch..."
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

        {/* Year Filter Pills */}
        <div className="filter-pill-group">
          {["ALL", "1st Year", "2nd Year", "3rd Year", "4th Year"].map((yr) => (
            <button
              key={yr}
              onClick={() => setFilterYear(yr)}
              className={`filter-pill ${filterYear === yr ? "active" : ""}`}
            >
              {yr === "ALL" ? "All Years" : yr}
            </button>
          ))}
        </div>

        {/* Voting Status Filter Pills */}
        <div className="filter-pill-group">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`filter-pill ${filterStatus === "ALL" ? "active" : ""}`}
          >
            All Status
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
              <th>Academic Year</th>
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
                      src={voter.photoUrl || DEFAULT_AVATAR}
                      alt={voter.name}
                      className="voter-avatar-img"
                      onError={(e) => {
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    <div>
                      <div className="voter-name">{voter.name}</div>
                      <div className="voter-email">{voter.email || `${voter.studentId.toLowerCase()}@campus.edu`}</div>
                    </div>
                  </div>
                </td>

                {/* Student ID */}
                <td>
                  <span className="font-mono text-bold text-primary">{voter.studentId}</span>
                </td>

                {/* Academic Year */}
                <td>
                  <span className={`badge ${
                    voter.year === "1st Year" ? "badge-blue" :
                    voter.year === "2nd Year" ? "badge-neutral" :
                    voter.year === "3rd Year" ? "badge-warning" : "badge-success"
                  }`}>
                    {voter.year || "3rd Year"}
                  </span>
                </td>

                {/* Father */}
                <td>{voter.fatherName || "N/A"}</td>

                {/* Course & Semester */}
                <td>
                  <div className="voter-course-cell">
                    <span className="voter-course-title">{voter.course}</span>
                    <span className="voter-sem-badge">{voter.semester}</span>
                  </div>
                </td>

                {/* Status */}
                <td>
                  {voter.hasVoted ? (
                    <div className="status-badge-voted">
                      <CheckCircle2 size={16} />
                      <span>Voted</span>
                      {voter.votedAt && (
                        <span className="voted-time">
                          ({new Date(voter.votedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="status-badge-eligible">
                      <Clock size={16} />
                      <span>Eligible to Vote</span>
                    </div>
                  )}
                </td>

                {/* Delete */}
                <td className="text-right">
                  <button
                    onClick={() => deleteVoter(voter.studentId)}
                    className="icon-action-btn delete"
                    title="Remove voter record"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredVoters.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  No registered student voters found matching your search and filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Single Add Voter Modal via Portal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="lg"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <UserPlus size={22} color="#2563eb" />
            </div>
            <div>
              <h3>Register Eligible Voter</h3>
              <p>Add an individual student with credentials to the official electoral roll</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(false)} className="modal-close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div className="alert-box alert-error mx-4 mt-3">
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddSubmit}>
          <div className="modal-form-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Student ID / Roll No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 26962047"
                  value={stuId}
                  onChange={(e) => setStuId(e.target.value)}
                  className="form-input"
                  autoFocus
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
                  placeholder="e.g. B.Sc Nursing"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Academic Year *</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="form-select"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label>Semester *</label>
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

              {/* Compact Photo Card (No huge scrolling dropzone) */}
              <div className="form-group full-width">
                <label>Student Profile Photograph</label>
                
                <input 
                  type="file" 
                  ref={voterFileInputRef} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processVoterImageFile(file);
                  }} 
                  accept="image/*" 
                  style={{ display: "none" }} 
                />

                <div 
                  className={`compact-photo-card ${isDragging ? "dragging" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleVoterDrop}
                >
                  <div className="compact-avatar-preview">
                    <img src={photoUrl} alt="Preview" className="compact-thumb" />
                    <div className="compact-photo-meta">
                      <strong>{uploadedFileName || "Default Profile Avatar"}</strong>
                      <span>Upload photo file or keep clean default avatar</span>
                    </div>
                  </div>

                  <div className="compact-photo-actions">
                    <button 
                      type="button" 
                      onClick={() => voterFileInputRef.current?.click()}
                      className="btn-secondary btn-sm"
                    >
                      <Upload size={14} /> Upload Photo
                    </button>
                    {photoUrl !== DEFAULT_AVATAR && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setPhotoUrl(DEFAULT_AVATAR);
                          setUploadedFileName("");
                        }}
                        className="btn-link-action"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                </div>
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
              <UserPlus size={16} /> Register Voter
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Import Modal via Portal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        size="lg"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <FileSpreadsheet size={22} color="#2563eb" />
            </div>
            <div>
              <h3>Bulk Voter Roster Import</h3>
              <p>Paste comma-separated rows or upload CSV exported from college ERP</p>
            </div>
          </div>
          <button onClick={() => setShowImportModal(false)} className="modal-close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-pad">
          <div className="flex-between items-center mb-2">
            <span className="font-semibold text-sm">Paste CSV Data:</span>
            <button onClick={handleDownloadSampleCsv} className="btn-link-action">
              <Download size={14} /> Download Sample CSV Template
            </button>
          </div>

          <textarea
            rows={8}
            placeholder="StudentID, StudentName, FatherName, Course, Semester, AcademicYear..."
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="form-textarea font-mono text-sm"
          />

          {importSummary && (
            <div className={`alert-box mt-3 ${importSummary.error ? "alert-error" : "alert-success"}`}>
              <span>{importSummary.error || importSummary.success}</span>
            </div>
          )}
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
            Process & Import Voters
          </button>
        </div>
      </Modal>
    </div>
  );
};
