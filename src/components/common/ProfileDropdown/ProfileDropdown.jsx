import { useState, useEffect, useRef } from 'react';
import './ProfileDropdown.css';
import profileIcon from '../../../assets/Profile-Icon.svg';
import { useLanguage } from '../../../i18n/LanguageContext';

function ProfileDropdown({ user, onLogout, onViewProfile }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return profileIcon;
    
    // Si ya es una URL completa, devolverla tal cual
    if (user.avatarUrl.startsWith('http')) {
      return user.avatarUrl;
    }
    
    // Si es una ruta relativa, agregar el prefijo del backend
    return `http://localhost:8080${user.avatarUrl}`;
  };

  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  const handleAvatarClick = () => {
    if (isMobile()) {
      // En móvil, ir directo al perfil
      if (onViewProfile) {
        onViewProfile();
      }
    } else {
      // En escritorio, mostrar dropdown
      setShowDropdown(!showDropdown);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button 
        className="btn-icon" 
        onClick={handleAvatarClick} 
        title="Mi Perfil"
      >
        <img 
          src={getAvatarUrl()} 
          alt="Perfil" 
          className={user?.avatarUrl ? "profile-avatar-small" : "profile-icon"} 
        />
      </button>
      {showDropdown && !isMobile() && (
        <div className="profile-dropdown">
          <button 
            className="dropdown-item" 
            onClick={() => {
              setShowDropdown(false);
              if (onViewProfile) {
                onViewProfile();
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {t('viewProfile')}
          </button>
          <button 
            className="dropdown-item" 
            onClick={() => {
              setShowDropdown(false);
              onLogout();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
