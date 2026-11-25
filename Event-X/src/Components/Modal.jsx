
import React, { useEffect } from "react";
import { X } from "lucide-react";
import "./Modal.css";

function Modal({
  isOpen,
  onClose,
  title,
  children
}) {

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >

        <div className="modal-header">

          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>

        </div>

        <div className="modal-body">
          {children}
        </div>

      </div>

    </div>
  );
}

export default Modal;
