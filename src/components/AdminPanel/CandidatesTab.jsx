import React, { useState } from "react";
import { 
  UserPlus, 
  Trash2, 
  Edit3, 
  X, 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  GraduationCap 
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";

const SYMBOL_PRESETS = [
  { icon: "🦅", name: "Eagle" },
  { icon: "🌟", name: "Star" },
  { icon: "🚀", name: "Rocket" },
  { icon: "🦁", name: "Lion" },
  { icon: "⚡", name: "Lightning" },
  { icon: "🌿", name: "Green Branch" },
  { icon: "🎸", name: "Guitar" },
  { icon: "🏆", name: "Trophy" },
  { icon: "🎯", name: "Target" },
  { icon: "💡", name: "Torch" },
  { icon: "⚖️", name: "Scales" },
  { icon: "🔥", name: "Flame" }
];

const PHOTO_PRESETS = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
];

export const CandidatesTab = () => {
  const { positions, candidates, addCandidate, updateCandidate, deleteCandidate } = useElection();
  const [selectedPosFilter, setSelectedPosFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  // Form State
  const [formPosId, setFormPosId] = useState(positions[0]?.id || "");
  const [formName, setFormName] = useState("");
  const [formRollNo, setFormRollNo] = useState("");
  const [formDept, setFormDept] = useState("Computer Science & Eng.");
  const [formYear, setFormYear] = useState("3rd Year");
  const [formSymbolIcon, setFormSymbolIcon] = useState("🦅");
  const [formSymbolName, setFormSymbolName] = useState("Eagle");
  const [formAvatarUrl, setFormAvatarUrl] = useState(PHOTO_PRESETS[0]);
  const [formManifesto, setFormManifesto] = useState("");

  const filteredCandidates = selectedPosFilter === "ALL" 
    ? candidates 
    : candidates.filter((c) => c.positionId === selectedPosFilter);

  const handleOpenAdd = () => {
    setEditingCandidate(null);
    setFormPosId(positions[0]?.id || "");
    setFormName("");
    setFormRollNo("");
    setFormDept("Computer Science & Eng.");
    setFormYear("3rd Year");
    setFormSymbolIcon("🦅");
    setFormSymbolName("Eagle");
    setFormAvatarUrl(PHOTO_PRESETS[Math.floor(Math.random() * PHOTO_PRESETS.length)]);
    setFormManifesto("");
    setShowAddModal(true);
  };

  const handleOpenEdit = (cand) => {
    setEditingCandidate(cand);
    setFormPosId(cand.positionId);
    setFormName(cand.name);
    setFormRollNo(cand.rollNo);
    setFormDept(cand.department || "");
    setFormYear(cand.year || "3rd Year");
    setFormSymbolIcon(cand.symbolIcon || "🌟");
    setFormSymbolName(cand.symbolName || "Symbol");
    setFormAvatarUrl(cand.avatarUrl || PHOTO_PRESETS[0]);
    setFormManifesto(cand.manifesto || "");
    setShowAddModal(true);
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
      symbolIcon: formSymbolIcon,
      symbolName: formSymbolName,
      avatarUrl: formAvatarUrl,
      manifesto: formManifesto.trim()
    };

    if (editingCandidate) {
      updateCandidate(editingCandidate.id, candData);
    } else {
      addCandidate(candData);
    }

    setShowAddModal(false);
  };

  return (
    <div className="admin-subtab-container fade-in">
      {/* Subtab Header */}
      <div className="subtab-header">
        <div>
          <h2 className="subtab-title">Candidate Nominations</h2>
          <p className="subtab-desc">
            Register and manage nominated candidates, campaign symbols, photographs, and manifestos for each electoral post.
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

      {/* Candidate Cards Grid */}
      <div className="candidates-grid">
        {filteredCandidates.map((cand) => {
          const pos = positions.find((p) => p.id === cand.positionId);
          return (
            <div key={cand.id} className="candidate-admin-card card-base">
              {/* Card Header with Post Badge */}
              <div className="card-top-row">
                <span className="badge badge-blue">
                  <Layers size={11} /> {pos?.title || "Position"}
                </span>
                <span className="candidate-symbol-badge" title={`Symbol: ${cand.symbolName}`}>
                  <span className="symbol-icon">{cand.symbolIcon}</span>
                  <span className="symbol-text">{cand.symbolName}</span>
                </span>
              </div>

              {/* Photo & Basic Details */}
              <div className="cand-main-profile">
                <div className="cand-avatar-wrap">
                  <img
                    src={cand.avatarUrl}
                    alt={cand.name}
                    className="cand-avatar-img"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>
                <div className="cand-profile-text">
                  <h3 className="cand-name">{cand.name}</h3>
                  <div className="cand-meta-line">
                    <span className="cand-roll">{cand.rollNo}</span>
                    <span className="dot-sep">•</span>
                    <span className="cand-dept">{cand.department}</span>
                  </div>
                  <div className="cand-year-line">
                    <GraduationCap size={13} /> {cand.year || "Enrolled Student"}
                  </div>
                </div>
              </div>

              {/* Manifesto Preview */}
              {cand.manifesto && (
                <div className="cand-manifesto-box">
                  <div className="manifesto-label">Manifesto:</div>
                  <p className="manifesto-quote">"{cand.manifesto}"</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="cand-card-footer">
                <div className="votes-metric">
                  <span className="votes-count">{cand.votes || 0}</span>
                  <span className="votes-label">Votes Polled</span>
                </div>
                <div className="cand-btn-actions">
                  <button
                    onClick={() => handleOpenEdit(cand)}
                    className="action-icon-btn btn-edit"
                    title="Edit Candidate Profile"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove nomination for candidate ${cand.name}?`)) {
                        deleteCandidate(cand.id);
                      }
                    }}
                    className="action-icon-btn btn-delete"
                    title="Delete Candidate"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="empty-state-card card-base">
          <Sparkles size={36} color="#94a3b8" />
          <h3>No Candidates Nominated Yet</h3>
          <p>Click "Nominate New Candidate" to add candidates with photos and election symbols under this post.</p>
        </div>
      )}

      {/* Add / Edit Candidate Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content candidate-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge">
                  <UserPlus size={20} color="#2563eb" />
                </div>
                <div>
                  <h3>{editingCandidate ? "Edit Candidate Profile" : "Nominate Candidate"}</h3>
                  <p>Assign candidate details, electoral symbol, and photo credentials</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-body">
              <div className="form-grid">
                {/* Electoral Post Dropdown */}
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
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Roll No */}
                <div className="form-group">
                  <label>Student Roll / ID No. *</label>
                  <input
                    type="text"
                    required
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

                {/* Year / Semester */}
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

                {/* Symbol Picker */}
                <div className="form-group full-width">
                  <label>Election Campaign Symbol</label>
                  <div className="symbol-selector-wrap">
                    <div className="symbol-presets-grid">
                      {SYMBOL_PRESETS.map((sym) => (
                        <button
                          type="button"
                          key={sym.name}
                          onClick={() => {
                            setFormSymbolIcon(sym.icon);
                            setFormSymbolName(sym.name);
                          }}
                          className={`symbol-preset-btn ${formSymbolName === sym.name ? "selected" : ""}`}
                        >
                          <span className="preset-icon">{sym.icon}</span>
                          <span className="preset-name">{sym.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="symbol-custom-row">
                      <input
                        type="text"
                        placeholder="Icon (e.g. 🦅)"
                        value={formSymbolIcon}
                        onChange={(e) => setFormSymbolIcon(e.target.value)}
                        className="form-input symbol-icon-input"
                      />
                      <input
                        type="text"
                        placeholder="Symbol Name (e.g. Soaring Eagle)"
                        value={formSymbolName}
                        onChange={(e) => setFormSymbolName(e.target.value)}
                        className="form-input flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo URL & Presets */}
                <div className="form-group full-width">
                  <label>Candidate Photograph URL</label>
                  <div className="photo-input-group">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formAvatarUrl}
                      onChange={(e) => setFormAvatarUrl(e.target.value)}
                      className="form-input"
                    />
                    <div className="photo-preview-box">
                      <img src={formAvatarUrl} alt="Preview" className="photo-thumb" />
                    </div>
                  </div>
                  <div className="photo-presets-row">
                    <span className="photo-preset-label">Quick Avatar Presets:</span>
                    {PHOTO_PRESETS.map((url, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setFormAvatarUrl(url)}
                        className={`avatar-preset-btn ${formAvatarUrl === url ? "active" : ""}`}
                      >
                        <img src={url} alt={`Preset ${i}`} />
                      </button>
                    ))}
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

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCandidate ? "Save Updates" : "Nominate Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
