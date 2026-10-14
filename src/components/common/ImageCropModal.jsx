import React, { useState, useRef, useEffect } from "react";
import { Modal } from "./Modal";
import { ZoomIn, ZoomOut, RotateCw, Check, X, Crop, Move, RefreshCw } from "lucide-react";

export const ImageCropModal = ({ isOpen, imageSrc, onClose, onCropComplete }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, loaded: false });

  const dragStartRef = useRef({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const CROP_DIAMETER = 220; // Diameter of circular crop frame on screen
  const CONTAINER_SIZE = 360; // Box width & height on screen

  // When image loads or modal opens, measure natural dimensions and set initial fit
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImageDimensions({ width: 0, height: 0, loaded: false });

      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth || 400,
          height: img.naturalHeight || 400,
          loaded: true
        });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Calculate base display size (fitted so shorter side covers the crop circle at zoom=1)
  let baseWidth = CROP_DIAMETER;
  let baseHeight = CROP_DIAMETER;

  if (imageDimensions.loaded && imageDimensions.width > 0 && imageDimensions.height > 0) {
    const isRotated90or270 = rotation === 90 || rotation === 270;
    const effectiveW = isRotated90or270 ? imageDimensions.height : imageDimensions.width;
    const effectiveH = isRotated90or270 ? imageDimensions.width : imageDimensions.height;

    if (effectiveW >= effectiveH) {
      baseHeight = CROP_DIAMETER;
      baseWidth = (effectiveW / effectiveH) * CROP_DIAMETER;
    } else {
      baseWidth = CROP_DIAMETER;
      baseHeight = (effectiveH / effectiveW) * CROP_DIAMETER;
    }
  }

  // Handle Drag / Pan with mouse
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.startOffsetX + dx,
      y: dragStartRef.current.startOffsetY + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for tablets/phones
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        startOffsetX: offset.x,
        startOffsetY: offset.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setOffset({
      x: dragStartRef.current.startOffsetX + dx,
      y: dragStartRef.current.startOffsetY + dy
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((z) => Math.min(2.5, Math.max(0.5, parseFloat((z + delta).toFixed(2)))));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setOffset({ x: 0, y: 0 }); // reset offset on rotate to prevent jumping
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Generate crisp cropped JPEG (~15-20 KB)
  const handleApplyCrop = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;

    // High-Definition Portrait Export (520x520 Retina HD, crystal-clear, zero-blur)
    const OUT_SIZE = 520; 
    const canvas = document.createElement("canvas");
    canvas.width = OUT_SIZE;
    canvas.height = OUT_SIZE;
    const ctx = canvas.getContext("2d");

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clean white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, OUT_SIZE, OUT_SIZE);

    ctx.save();
    // Center at canvas origin
    ctx.translate(OUT_SIZE / 2, OUT_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate drawn size based on crop window ratio
    const renderScale = OUT_SIZE / CROP_DIAMETER;
    const drawW = baseWidth * zoom * renderScale;
    const drawH = baseHeight * zoom * renderScale;

    // Apply rotation-aware offset
    const rad = (-rotation * Math.PI) / 180;
    const rotX = offset.x * Math.cos(rad) - offset.y * Math.sin(rad);
    const rotY = offset.x * Math.sin(rad) + offset.y * Math.cos(rad);

    const drawX = -drawW / 2 + (rotX * renderScale);
    const drawY = -drawH / 2 + (rotY * renderScale);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Export as ultra-crisp studio HD JPEG (~35-50 KB)
    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="modal-header">
        <div className="modal-title-wrap">
          <div className="modal-icon-badge" style={{ background: "rgba(37, 99, 235, 0.15)", color: "#3b82f6" }}>
            <Crop size={20} />
          </div>
          <div>
            <h3>Adjust & Crop Candidate Portrait</h3>
            <p>Your full photo is shown below. Drag to position face inside the circle.</p>
          </div>
        </div>
        <button onClick={onClose} className="modal-close-btn" type="button">
          <X size={20} />
        </button>
      </div>

      <div className="modal-form-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.25rem 1rem" }}>
        
        {/* Workspace Canvas Container (Shows whole image with circular cutout guide) */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          style={{
            position: "relative",
            width: `${CONTAINER_SIZE}px`,
            maxWidth: "100%",
            height: `${CONTAINER_SIZE}px`,
            background: "#090d16",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 12px 30px rgba(0, 0, 0, 0.5)",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            touchAction: "none"
          }}
        >
          {/* Entire movable rectangle photo */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.08s ease-out",
              pointerEvents: "none"
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Source"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
                display: "block",
                boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
              }}
            />
          </div>

          {/* Semi-transparent dark mask with circular cutout */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                width: `${CROP_DIAMETER}px`,
                height: `${CROP_DIAMETER}px`,
                borderRadius: "50%",
                // Creates dark dimming everywhere outside the circle, leaving circle crystal clear!
                boxShadow: "0 0 0 9999px rgba(9, 13, 22, 0.72)",
                border: "2.5px solid #3b82f6",
                position: "relative"
              }}
            >
              {/* Subtle grid crosshair inside circle */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "1px dashed rgba(255, 255, 255, 0.35)",
                  pointerEvents: "none"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "14px",
                  height: "14px",
                  transform: "translate(-50%, -50%)",
                  borderTop: "1.5px solid rgba(255, 255, 255, 0.5)",
                  borderLeft: "1.5px solid rgba(255, 255, 255, 0.5)",
                  pointerEvents: "none"
                }}
              />
            </div>
          </div>

          {/* Top-right "Drag to move" pill */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(4px)",
              padding: "4px 10px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.78rem",
              color: "#94a3b8",
              pointerEvents: "none"
            }}
          >
            <Move size={12} color="#38bdf8" />
            <span>Drag photo to center face</span>
          </div>
        </div>

        {/* Framing explanation */}
        <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "10px", textAlign: "center" }}>
          The bright circular area is what will be saved as the candidate's portrait.
        </div>

        {/* Interactive Controls Bar: Zoom Slider, Rotate, Reset */}
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            marginTop: "12px",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.82rem", color: "#cbd5e1", fontWeight: 500 }}>
              Zoom: <strong>{Math.round(zoom * 100)}%</strong>
            </span>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={handleRotate}
                className="btn-secondary btn-sm"
                style={{ padding: "3px 8px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}
                title="Rotate image 90 degrees"
              >
                <RotateCw size={12} /> Rotate 90°
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary btn-sm"
                style={{ padding: "3px 8px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}
                title="Reset zoom and position"
              >
                <RefreshCw size={12} /> Fit
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ZoomOut
              size={16}
              color="#64748b"
              onClick={() => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))))}
              style={{ cursor: "pointer" }}
              title="Zoom out"
            />
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: "#2563eb", cursor: "pointer" }}
            />
            <ZoomIn
              size={16}
              color="#64748b"
              onClick={() => setZoom((z) => Math.min(2.5, parseFloat((z + 0.1).toFixed(2))))}
              style={{ cursor: "pointer" }}
              title="Zoom in"
            />
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={handleApplyCrop} className="btn-primary">
          <Check size={16} /> Crop & Save Portrait
        </button>
      </div>
    </Modal>
  );
};
