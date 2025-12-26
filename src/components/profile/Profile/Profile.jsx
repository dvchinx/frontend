import { useState, useEffect, useRef } from 'react';
import './Profile.css';
import { getProfile, updateProfile, uploadAvatar, deleteAvatar } from '../../../services/profileService';
import profileIcon from '../../../assets/Profile-Icon.svg';
import { useLanguage } from '../../../i18n/LanguageContext';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const { t, changeLanguage } = useLanguage();

  const [formData, setFormData] = useState({
    birthDate: '',
    gender: '',
    language: 'ES',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getProfile();
    
    if (result.success) {
      setProfile(result.data);
      setFormData({
        birthDate: result.data.birthDate || '',
        gender: result.data.gender || '',
        language: result.data.language || 'ES',
      });
      
      // Sincronizar idioma con el contexto
      if (result.data.language) {
        changeLanguage(result.data.language);
      }
      
      // Construir URL completa del avatar si existe
      if (result.data.avatarUrl) {
        const avatarUrl = result.data.avatarUrl.startsWith('http') 
          ? result.data.avatarUrl 
          : result.data.avatarUrl;
        setAvatarPreview(avatarUrl);
      } else {
        setAvatarPreview(null);
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si cambia el idioma, actualizar inmediatamente la UI
    if (name === 'language') {
      changeLanguage(value);
    }
    
    setHasChanges(true);
    setError(null);
    setSuccess(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación frontend
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no soportado. Solo PNG, JPG o JPEG');
      return;
    }

    if (file.size > maxSize) {
      setError('El archivo excede el tamaño máximo permitido (5MB)');
      return;
    }

    setAvatarFile(file);
    setError(null);
    setSuccess(null);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    const result = await uploadAvatar(avatarFile);

    if (result.success) {
      setSuccess('Avatar actualizado correctamente');
      setAvatarFile(null);
      loadProfile();
    } else {
      setError(result.error);
      // Revertir al avatar anterior si existe
      if (profile?.avatarUrl) {
        const avatarUrl = profile.avatarUrl.startsWith('http') 
          ? profile.avatarUrl 
          : profile.avatarUrl;
        setAvatarPreview(avatarUrl);
      } else {
        setAvatarPreview(null);
      }
    }

    setUploadingAvatar(false);
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?')) {
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    const result = await deleteAvatar();

    if (result.success) {
      setSuccess('Avatar eliminado correctamente');
      setAvatarPreview(null);
      loadProfile();
    } else {
      setError(result.error);
    }

    setUploadingAvatar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación
    if (!formData.language) {
      setError('El idioma es requerido');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const result = await updateProfile(formData);

    setSaving(false);

    if (result.success) {
      setSuccess('Perfil actualizado correctamente');
      setHasChanges(false);
      loadProfile();
      
      // Si ahora está completo, redirigir
      if (result.data.isCompleted) {
        setTimeout(() => {
          window.location.href = '/to-do';
        }, 1500);
      }
    } else {
      setError(result.error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.4 31.4" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-left">
          <h1 className="profile-title">{t('myProfile')}</h1>
          {!profile?.isCompleted && (
            <span className="profile-incomplete-badge">{t('incompleteProfile')}</span>
          )}
        </div>
        <div className="profile-header-actions">
          <button onClick={handleLogout} className="btn-secondary">
            {t('logout')}
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            <img 
              src={avatarPreview || profileIcon} 
              alt="Avatar" 
              className="profile-avatar"
            />
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          
          <div className="avatar-actions">
            <button 
              onClick={handleAvatarClick} 
              className="btn-secondary"
              disabled={uploadingAvatar}
            >
              {t('changePhoto')}
            </button>
            
            {avatarFile && (
              <button 
                onClick={handleUploadAvatar} 
                className="btn-primary"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? t('uploading') : t('savePhoto')}
              </button>
            )}
            
            {profile?.avatarUrl && !avatarFile && (
              <button 
                onClick={handleDeleteAvatar} 
                className="btn-danger"
                disabled={uploadingAvatar}
              >
                {t('deletePhoto')}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3 className="form-section-title">{t('personalInfo')}</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">{t('name')}</label>
                <input
                  type="text"
                  id="name"
                  value={profile?.name || ''}
                  disabled
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">{t('lastName')}</label>
                <input
                  type="text"
                  id="lastName"
                  value={profile?.lastName || ''}
                  disabled
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="email">{t('email')}</label>
                <input
                  type="email"
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthDate">
                  {t('birthDate')} {!formData.birthDate && <span className="required">*</span>}
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  {t('gender')} {!formData.gender && <span className="required">*</span>}
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">{t('select')}</option>
                  <option value="MALE">{t('male')}</option>
                  <option value="FEMALE">{t('female')}</option>
                  <option value="OTHER">{t('other')}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="language">{t('language')} <span className="required">*</span></label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="ES">{t('spanish')}</option>
                  <option value="EN">{t('english')}</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!hasChanges || saving}
            >
              {saving ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
