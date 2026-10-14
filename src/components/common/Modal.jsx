import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Global counter to safely track multiple or nested open modals across the entire app
let activeModalsCount = 0;

/**
 * Universal Portal Modal Component
 * Renders directly at document.body level using React Portals.
 * Centered in active viewport with bulletproof scroll unlocking.
 */
export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "", 
  size = "md" 
}) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) {
      // Whenever a modal is closed, ensure scroll is fully restored if no other modals remain
      const timer = setTimeout(() => {
        const remaining = document.querySelectorAll(".modal-overlay").length;
        if (remaining === 0) {
          activeModalsCount = 0;
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
          document.documentElement.style.overflow = "";
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    activeModalsCount++;
    document.body.style.overflow = "hidden";

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onCloseRef.current) {
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      activeModalsCount = Math.max(0, activeModalsCount - 1);

      // Asynchronous failsafe: check remaining overlays in DOM after unmount
      setTimeout(() => {
        const remaining = document.querySelectorAll(".modal-overlay").length;
        if (remaining === 0 || activeModalsCount <= 0) {
          activeModalsCount = 0;
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
          document.documentElement.style.overflow = "";
        }
      }, 30);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = 
    size === "lg" ? "modal-lg" : 
    size === "xl" ? "modal-xl" : 
    size === "sm" ? "modal-sm" : 
    "modal-md";

  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`modal-content ${sizeClass} ${className}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
