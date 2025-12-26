import { useEffect } from 'react';
import { handleOAuthRedirect } from '../../services/authService';

function OAuthRedirect() {
  useEffect(() => {
    const isSuccess = handleOAuthRedirect();
    
    if (isSuccess) {
      // Redirigir al Kanban después de guardar el token
      window.location.href = '/to-do';
    } else {
      // Si no hay token, redirigir a la página principal
      window.location.href = '/';
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#1a1a24',
      color: 'white',
      fontSize: '1.2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem' }}>
          <svg className="spinner" width="60" height="60" viewBox="0 0 24 24" style={{ color: '#6B73FF' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.4 31.4" />
          </svg>
        </div>
        <p>Procesando autenticación...</p>
      </div>
      <style>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default OAuthRedirect;
