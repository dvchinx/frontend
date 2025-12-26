import './ProfileWarningModal.css';

function ProfileWarningModal({ onGoToProfile, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="profile-warning-modal-overlay" onClick={handleOverlayClick}>
      <div className="profile-warning-modal">
        <div className="profile-warning-modal-header">
          <h2 className="profile-warning-modal-title">Completa tu perfil</h2>
          <button className="profile-warning-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="profile-warning-modal-body">
          <div className="warning-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p>Por favor, completa tu perfil agregando la siguiente información:</p>
          <ul>
            <li>Fecha de nacimiento</li>
            <li>Género</li>
            <li>Idioma</li>
            <li>Foto de perfil</li>
          </ul>
        </div>
        
        <div className="profile-warning-modal-actions">
          <button className="profile-warning-btn profile-warning-btn-secondary" onClick={onClose}>
            Más tarde
          </button>
          <button className="profile-warning-btn profile-warning-btn-primary" onClick={onGoToProfile}>
            Ir a mi perfil
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileWarningModal;
