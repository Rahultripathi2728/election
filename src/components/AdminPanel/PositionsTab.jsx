import React, { useState } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Layers, 
  Users, 
  ListOrdered 
} from "lucide-react";
import { useElection } from "../../context/ElectionContext";
import { Modal } from "../common/Modal";

export const PositionsTab = () => {
  const { positions, candidates, addPosition, updatePosition, deletePosition, movePositionSequence } = useElection();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosId, setEditingPosId] = useState(null);
  const [syncNotice, setSyncNotice] = useState("");

  const triggerNotice = (msg) => {
    setSyncNotice(msg);
    setTimeout(() => setSyncNotice(""), 3500);
  };

  // New Position Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [allowNota, setAllowNota] = useState(true);

  // Edit Position Form state
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleStartEdit = (pos) => {
    setEditingPosId(pos.id);
    setEditTitle(pos.title);
    setEditDesc(pos.description || "");
  };

  const handleSaveEdit = (id) => {
    if (!editTitle.trim()) return;
    updatePosition(id, {
      title: editTitle.trim(),
      description: editDesc.trim()
    });
    setEditingPosId(null);
    triggerNotice(`Saved "${editTitle.trim()}" permanently to Cloud Firestore!`);
  };

  const handleCreatePosition = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const title = newTitle.trim();
    addPosition({
      title,
      description: newDesc.trim() || "Electoral Post",
      allowNota
    });
    setNewTitle("");
    setNewDesc("");
    setShowAddModal(false);
    triggerNotice(`Created "${title}" and saved permanently to Cloud Firestore!`);
  };

  return (
    <div className="admin-subtab-container fade-in">
      {/* Subtab Header */}
      <div className="subtab-header">
        <div>
          <h2 className="subtab-title">Electoral Positions & Ballot Sequencing</h2>
          <p className="subtab-desc">
            Define election posts and arrange their exact ranking order. Voters will experience this exact sequence on the EVM.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={18} />
          <span>Add New Electoral Post</span>
        </button>
      </div>

      {syncNotice && (
        <div 
          className="fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#34d399",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "0.9rem",
            fontWeight: 500
          }}
        >
          <Check size={18} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Positions Ordering Notice */}
      <div className="sequence-callout">
        <ListOrdered size={20} className="seq-icon" />
        <div>
          <strong>Sequential EVM Presentation:</strong> The position at Rank #1 will be the first ballot displayed to the voter. 
          Use the <strong>Up (▲)</strong> and <strong>Down (▼)</strong> buttons to adjust the sequence.
        </div>
      </div>

      {/* Positions List */}
      <div className="positions-list">
        {positions.map((pos, index) => {
          const posCandidates = candidates.filter((c) => c.positionId === pos.id);
          const isFirst = index === 0;
          const isLast = index === positions.length - 1;

          if (editingPosId === pos.id) {
            return (
              <div key={pos.id} className="position-card editing-card card-base">
                <div className="edit-form-row">
                  <div className="form-group flex-1">
                    <label>Position Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group flex-2">
                    <label>Description / Mandate</label>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="edit-actions">
                    <button
                      onClick={() => handleSaveEdit(pos.id)}
                      className="btn-success btn-sm"
                      title="Save Changes"
                    >
                      <Check size={16} /> Save
                    </button>
                    <button
                      onClick={() => setEditingPosId(null)}
                      className="btn-secondary btn-sm"
                      title="Cancel"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={pos.id} className="position-card card-base">
              {/* Sequence Rank Indicator */}
              <div className="seq-rank-badge" title={`Rank ${pos.sequence} in ballot order`}>
                <span className="rank-label">STEP</span>
                <span className="rank-number">{pos.sequence}</span>
              </div>

              {/* Position Info */}
              <div className="pos-info">
                <div className="pos-title-row">
                  <h3 className="pos-title">{pos.title}</h3>
                  <span className="badge badge-neutral">
                    <Users size={12} /> {posCandidates.length} Nominees
                  </span>
                </div>
                <p className="pos-description">{pos.description || "Official Electoral Office"}</p>
                
                {/* Candidate avatars preview */}
                <div className="pos-cand-preview">
                  {posCandidates.map((c) => (
                    <span key={c.id} className="cand-mini-pill" title={`${c.name} (${c.department})`}>
                      {c.symbolIcon ? <span className="cand-mini-symbol">{c.symbolIcon}</span> : null}
                      <span className="cand-mini-name">{c.name}</span>
                    </span>
                  ))}
                  {posCandidates.length === 0 && (
                    <span className="text-muted text-sm">No candidates nominated yet under this post.</span>
                  )}
                </div>
              </div>

              {/* Sequence Control Buttons */}
              <div className="pos-controls">
                <div className="seq-btn-group">
                  <button
                    onClick={() => {
                      movePositionSequence(pos.id, "UP");
                      triggerNotice(`Updated ballot order in Cloud Firestore!`);
                    }}
                    disabled={isFirst}
                    className="seq-btn"
                    title="Move earlier in ballot sequence"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => {
                      movePositionSequence(pos.id, "DOWN");
                      triggerNotice(`Updated ballot order in Cloud Firestore!`);
                    }}
                    disabled={isLast}
                    className="seq-btn"
                    title="Move later in ballot sequence"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                <div className="action-btn-group">
                  <button
                    onClick={() => handleStartEdit(pos)}
                    className="action-icon-btn btn-edit"
                    title="Edit Position"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${pos.title}" and its candidates?`)) {
                        deletePosition(pos.id);
                        triggerNotice(`Removed "${pos.title}" and saved to Cloud Firestore!`);
                      }
                    }}
                    className="action-icon-btn btn-delete"
                    title="Delete Position"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Position Modal via Portal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="md"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Layers size={20} color="#2563eb" />
            </div>
            <div>
              <h3>Add Electoral Post</h3>
              <p>Define a new executive post or representative seat for the election</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(false)} className="modal-close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreatePosition}>
          <div className="modal-form-body">
            <div className="form-group">
              <label>Position / Post Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Joint Secretary, Treasurer, Batch Representative"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-group mt-3">
              <label>Role Description & Mandate</label>
              <textarea
                rows={3}
                placeholder="Briefly describe the responsibilities of this position..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group checkbox-group mt-3">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowNota}
                  onChange={(e) => setAllowNota(e.target.checked)}
                />
                <span>Allow NOTA (None of the Above) option for this post</span>
              </label>
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
              <Plus size={16} /> Create Position
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
