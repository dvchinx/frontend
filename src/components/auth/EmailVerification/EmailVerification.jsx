import { useState, useEffect } from 'react';
import { verifyEmail } from '../../../services/authService';
import { useLanguage } from '../../../i18n/LanguageContext';
import './EmailVerification.css';

function EmailVerification() {
  const { t } = useLanguage();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('tokenNotFound'));
        return;
      }

      setMessage(t('verifying'));
      const result = await verifyEmail(token);

      if (result.success) {
        setStatus('success');
        setMessage(t('verificationSuccess'));
      } else {
        setStatus('error');
        setMessage(result.error || t('tokenInvalid'));
      }
    };

    verifyToken();
  }, [t]);

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className={`verification-icon ${status}`}>
          {status === 'verifying' && (
            <svg className="spinner" width="60" height="60" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.4 31.4" />
            </svg>
          )}
          {status === 'success' && (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="none"/>
              <path d="M8 12.5L10.5 15L16 9" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {status === 'error' && (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="none"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        
        <h2 className="verification-title">{t('emailVerification')}</h2>
        <p className={`verification-message ${status}`}>{message}</p>

        {status === 'success' && (
          <button 
            className="verification-button"
            onClick={() => window.location.href = '/'}
          >
            {t('goToLogin')}
          </button>
        )}

        {status === 'error' && (
          <button 
            className="verification-button secondary"
            onClick={() => window.location.href = '/'}
          >
            {t('backToHome')}
          </button>
        )}
      </div>
    </div>
  );
}

export default EmailVerification;
