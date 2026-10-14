import React, { useState, useRef } from "react";
import { 
  UserPlus, 
  Trash2, 
  Edit3, 
  X, 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  Upload,
  CheckCircle2,
  GraduationCap,
  FolderOpen,
  Crop,
  ChevronUp,
  ChevronDown,
  Hash
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { DEFAULT_AVATAR } from "../../utils/constants";
import { candidatePhotos } from "../../data/candidatePhotos";
import { compressImageFile } from "../../utils/imageCompressor";
import { Modal } from "../common/Modal";
import { ImageCropModal } from "../common/ImageCropModal";

export const CandidatesTab = () => {
  const { positions, candidates, addCandidate, updateCandidate, deleteCandidate, moveCandidateSequence } = useElection();
  const [selectedPosFilter, setSelectedPosFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  // Crop Modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState(null);

  // Form State
  const [formPosId, setFormPosId] = useState(positions[0]?.id || "");
  const [formName, setFormName] = useState("");
  const [formRollNo, setFormRollNo] = useState("");
  const [formDept, setFormDept] = useState("B.Sc Nursing");
  const [formYear, setFormYear] = useState("3rd Year");
  const [formAvatarUrl, setFormAvatarUrl] = useState(DEFAULT_AVATAR);
  const [formManifesto, setFormManifesto] = useState("");
  
  // Drag and Drop Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef(null);

  const filteredCandidates = selectedPosFilter === "ALL" 
    ? candidates 
    : candidates.filter((c) => c.positionId === selectedPosFilter);

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (a.positionId !== b.positionId) {
      const posA = positions.find((p) => p.id === a.positionId)?.sequence || 0;
      const posB = positions.find((p) => p.id === b.positionId)?.sequence || 0;
      return posA - posB;
    }
    return (a.sequence || 0) - (b.sequence || 0);
  });

  const handleOpenAdd = () => {
    setEditingCandidate(null);
    setFormPosId(selectedPosFilter !== "ALL" ? selectedPosFilter : (positions[0]?.id || ""));
    setFormName("");
    setFormRollNo("");
    setFormDept("B.Sc Nursing");
    setFormYear("3rd Year");
    setFormAvatarUrl(DEFAULT_AVATAR);
    setUploadedFileName("");
    setFormManifesto("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (cand) => {
    setEditingCandidate(cand);
    setFormPosId(cand.positionId);
    setFormName(cand.name);
    setFormRollNo(cand.rollNo);
    setFormDept(cand.department || "B.Sc Nursing");
    setFormYear(cand.year || "3rd Year");
    setFormAvatarUrl(cand.avatarUrl || DEFAULT_AVATAR);
    setUploadedFileName(cand.avatarUrl && cand.avatarUrl !== DEFAULT_AVATAR ? "Custom Candidate Photograph" : "");
    setFormManifesto(cand.manifesto || "");
    setShowAddModal(true);
  };

  const processImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImageForCrop(e.target.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPosId) return;

    const candData = {
      positionId: formPosId,
      name: formName.trim(),
      rollNo: formRollNo.trim(),
      department: formDept.trim(),
      year: formYear,
      symbolIcon: "",
      symbolName: "",
      avatarUrl: formAvatarUrl || DEFAULT_AVATAR,
      manifesto: formManifesto.trim()
    };

    if (editingCandidate) {
      updateCandidate(editingCandidate.id, candData);
    } else {
      addCandidate(candData);
    }

    setShowAddModal(false);
    setCropModalOpen(false);
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setCropModalOpen(false);
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };

  return (
    <div className="admin-subtab-container fade-in">
      {/* Subtab Header */}
      <div className="subtab-header">
        <div>
          <h2 className="subtab-title">Candidate Nominations</h2>
          <p className="subtab-desc">
            Register and manage nominated candidates, drag-and-drop campaign portraits, symbols, and manifestos.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary">
          <UserPlus size={18} />
          <span>Nominate New Candidate</span>
        </button>
      </div>

      {/* Filter Tabs by Position */}
      <div className="filter-bar">
        <span className="filter-label">Filter by Post:</span>
        <button
          onClick={() => setSelectedPosFilter("ALL")}
          className={`filter-pill ${selectedPosFilter === "ALL" ? "active" : ""}`}
        >
          All Posts ({candidates.length})
        </button>
        {positions.map((p) => {
          const count = candidates.filter((c) => c.positionId === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPosFilter(p.id)}
              className={`filter-pill ${selectedPosFilter === p.id ? "active" : ""}`}
            >
              {p.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Candidate Grid */}
      <div className="candidates-admin-grid">
        {sortedCandidates.map((cand) => {
          const pos = positions.find((p) => p.id === cand.positionId);
          const postCands = candidates
            .filter((c) => c.positionId === cand.positionId)
            .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
          const candIdx = postCands.findIndex((c) => c.id === cand.id);
          const isFirst = candIdx <= 0;
          const isLast = candIdx === postCands.length - 1;
          const ballotNumber = candIdx + 1;

          return (
            <div key={cand.id} className="candidate-admin-card card-base">
              <div className="card-top-row">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <span className="pos-chip">{pos?.title || "Unknown Post"}</span>
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe"
                  }}>
                    Ballot #{ballotNumber}
                  </span>
                </div>

                <div className="action-icons" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* Move Up / Down on Ballot */}
                  <div style={{ display: "inline-flex", alignItems: "center", background: "#f1f5f9", borderRadius: "8px", padding: "2px" }}>
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveCandidateSequence(cand.id, "UP")}
                      className="icon-action-btn"
                      title="Move Up on Ballot (Priority 1st)"
                      style={{
                        opacity: isFirst ? 0.3 : 1,
                        cursor: isFirst ? "not-allowed" : "pointer",
                        padding: "3px 5px",
                        border: "none",
                        background: "transparent"
                      }}
                    >
                      <ChevronUp size={15} color={isFirst ? "#94a3b8" : "#2563eb"} />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveCandidateSequence(cand.id, "DOWN")}
                      className="icon-action-btn"
                      title="Move Down on Ballot"
                      style={{
                        opacity: isLast ? 0.3 : 1,
                        cursor: isLast ? "not-allowed" : "pointer",
                        padding: "3px 5px",
                        border: "none",
                        background: "transparent"
                      }}
                    >
                      <ChevronDown size={15} color={isLast ? "#94a3b8" : "#2563eb"} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(cand)}
                    className="icon-action-btn edit"
                    title="Edit candidate profile"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => deleteCandidate(cand.id)}
                    className="icon-action-btn delete"
                    title="Remove candidate"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="cand-bio-row">
                <div className="cand-avatar-wrap">
                  <img 
                    src={
                      cand.avatarUrl &&
                      cand.avatarUrl !== DEFAULT_AVATAR &&
                      !cand.avatarUrl.startsWith("data:image/svg+xml")
                        ? cand.avatarUrl
                        : candidatePhotos[cand.id] || DEFAULT_AVATAR
                    } 
                    alt={cand.name} 
                    className="cand-avatar-img"
                    onError={(e) => {
                      if (candidatePhotos[cand.id]) {
                        e.target.src = candidatePhotos[cand.id];
                      } else {
                        e.target.src = DEFAULT_AVATAR;
                      }
                    }}
                  />
                </div>
                <div className="cand-bio-info">
                  <h3 className="cand-name">{cand.name}</h3>
                  <div className="cand-subtext">
                    <span>{cand.rollNo}</span> • <span>{cand.year}</span>
                  </div>
                  <div className="cand-dept">{cand.department}</div>
                </div>
              </div>

              {cand.manifesto && (
                <div className="cand-manifesto-box">
                  <p>"{cand.manifesto}"</p>
                </div>
              )}

              <div className="cand-votes-footer">
                <div className="votes-label">Votes Polled</div>
                <div className="votes-count">{cand.votes || 0}</div>
              </div>
            </div>
          );
        })}

        {filteredCandidates.length === 0 && (
          <div className="empty-state-card full-width">
            <Layers size={40} className="empty-icon text-muted" />
            <p>No candidates nominated for this post yet.</p>
            <button onClick={handleOpenAdd} className="btn-secondary mt-2">
              Add First Nominee
            </button>
          </div>
        )}
      </div>

      {/* Nomination Form Modal via Portal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        size="lg"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <UserPlus size={22} color="#2563eb" />
            </div>
            <div>
              <h3>{editingCandidate ? "Edit Candidate Nomination" : "Nominate New Candidate"}</h3>
              <p>Configure candidate details, academic program, portrait image, and manifesto</p>
            </div>
          </div>
          <button
            onClick={handleCloseAddModal}
            className="modal-close-btn"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0, overflow: "hidden" }}>
          <div className="modal-form-body">
            <div className="form-grid">
              {/* Target Electoral Position */}
              <div className="form-group full-width">
                <label>Electoral Post / Position *</label>
                <select
                  value={formPosId}
                  onChange={(e) => setFormPosId(e.target.value)}
                  className="form-select"
                  required
                >
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Step #{p.sequence})
                    </option>
                  ))}
                </select>
              </div>

              {/* Candidate Name */}
              <div className="form-group">
                <label>Candidate Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Roll No */}
              <div className="form-group">
                <label>Roll Number / Student ID</label>
                <input
                  type="text"
                  placeholder="e.g. CS-2022-014"
                  value={formRollNo}
                  onChange={(e) => setFormRollNo(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Department */}
              <div className="form-group">
                <label>Department / Branch</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Eng."
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Year */}
              <div className="form-group">
                <label>Academic Year</label>
                <select
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  className="form-select"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              {/* Compact Candidate Portrait Image Section */}
              <div className="form-group full-width">
                <label>Candidate Portrait Photograph</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: "none" }} 
                />

                <div 
                  className={`compact-photo-card ${isDragging ? "dragging" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  style={{
                    border: isDragging ? "2px dashed #2563eb" : "1.5px dashed rgba(255, 255, 255, 0.2)",
                    background: isDragging ? "rgba(37, 99, 235, 0.08)" : "rgba(255, 255, 255, 0.02)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div className="compact-avatar-preview">
                    <img 
                      src={formAvatarUrl || DEFAULT_AVATAR} 
                      alt="Candidate Preview" 
                      className="compact-thumb" 
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div className="compact-photo-meta">
                      <strong>{uploadedFileName || (formAvatarUrl !== DEFAULT_AVATAR ? "Custom Candidate Photograph" : "No photo uploaded yet")}</strong>
                      <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                        Drag & drop image here, or browse file. You can pan, zoom, and crop face to frame.
                      </span>
                    </div>
                  </div>

                  <div className="compact-photo-actions" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary btn-sm"
                      title="Select photo from computer"
                    >
                      <Upload size={14} /> {formAvatarUrl !== DEFAULT_AVATAR ? "Change Photo" : "Upload Photo"}
                    </button>

                    {formAvatarUrl !== DEFAULT_AVATAR && (
                      <button
                        type="button"
                        onClick={() => {
                          setRawImageForCrop(formAvatarUrl);
                          setCropModalOpen(true);
                        }}
                        className="btn-secondary btn-sm"
                        title="Adjust position, zoom, and crop framing"
                      >
                        <Crop size={14} /> Adjust / Crop
                      </button>
                    )}

                    {formAvatarUrl !== DEFAULT_AVATAR && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormAvatarUrl(DEFAULT_AVATAR);
                          setUploadedFileName("");
                        }}
                        className="btn-link-action"
                        style={{ fontSize: "0.8rem", color: "#ef4444" }}
                        title="Remove photo and restore default avatar"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Manifesto */}
              <div className="form-group full-width">
                <label>Campaign Manifesto / Key Promises</label>
                <textarea
                  rows={2}
                  placeholder="Briefly state key promises and vision for the campus..."
                  value={formManifesto}
                  onChange={(e) => setFormManifesto(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleCloseAddModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCandidate ? "Save Updates" : "Nominate Candidate"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Interactive Crop & Adjust Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageForCrop}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={(croppedDataUrl) => {
          setFormAvatarUrl(croppedDataUrl);
          setUploadedFileName("Custom Portrait (~18 KB, Framed)");
          if (editingCandidate) {
            updateCandidate(editingCandidate.id, { avatarUrl: croppedDataUrl });
          }
        }}
      />
    </div>
  );
};
