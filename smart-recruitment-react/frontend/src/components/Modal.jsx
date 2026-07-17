import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass modal-box">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        {children}
      </div>
    </div>
  );
}
