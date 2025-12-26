import React from 'react';
import './WelcomePanel.css';

const WelcomePanel = ({ userName }) => {
  return (
    <div className="welcome-panel">
      <div className="welcome-content">
        <h1 className="welcome-title">
          Bienvenido{userName ? `, ${userName}` : ''}
        </h1>
        <p className="welcome-subtitle">
          Selecciona una herramienta del menú lateral para comenzar
        </p>
        
        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Chat</h3>
            <p>Conversa con asistentes inteligentes y obtén respuestas instantáneas</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🖼️</div>
            <h3>Editor de Imágenes</h3>
            <p>Edita y procesa imágenes con herramientas avanzadas</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Gestión de Tareas</h3>
            <p>Organiza tu trabajo con tableros Kanban intuitivos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;
