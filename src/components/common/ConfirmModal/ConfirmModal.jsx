import './ConfirmModal.css';
import { useLanguage } from '../../../i18n/LanguageContext';

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  const { t } = useLanguage();
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">{title}</h2>
          <button className="confirm-modal-close" onClick={onCancel}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="confirm-modal-body">
          {message}
        </div>
        
        <div className="confirm-modal-actions">
          <button className="confirm-btn confirm-btn-cancel" onClick={onCancel}>
            {t('cancel')}
          </button>
          <button className="confirm-btn confirm-btn-delete" onClick={onConfirm}>
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
