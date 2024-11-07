// src/components/Modal.jsx
import React from 'react';
import '../style/Modal.css'; // You can create a CSS file for styling

const Modal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirmation</h2>
        <p>{message}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  );
};

export default Modal;