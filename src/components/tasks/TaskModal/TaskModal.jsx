import { useState, useEffect } from 'react';
import './TaskModal.css';
import { createTask, updateTask } from '../../../services/taskService';
import { useLanguage } from '../../../i18n/LanguageContext';

function TaskModal({ task, onClose, onSave }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError(t('titleRequired'));
      return;
    }

    setLoading(true);
    setError('');

    let result;
    if (task) {
      // Editar tarea existente
      result = await updateTask(task.id, formData);
    } else {
      // Crear nueva tarea
      result = await createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      });
    }

    setLoading(false);

    if (result.success) {
      onSave();
    } else {
      setError(result.error || t('saveError'));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {task ? t('editTask') : t('newTask')}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="error-message-modal">{error}</div>}

          <div className="form-group">
            <label className="form-label">{t('title')} *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder={t('titlePlaceholder')}
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('description')}</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder={t('descriptionPlaceholder')}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('priority')}</label>
            <select
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="LOW">{t('low')}</option>
              <option value="MEDIUM">{t('medium')}</option>
              <option value="HIGH">{t('high')}</option>
            </select>
          </div>

          {task && (
            <div className="form-group">
              <label className="form-label">{t('status')}</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="TODO">{t('pending')}</option>
                <option value="IN_PROGRESS">{t('inProgress')}</option>
                <option value="DONE">{t('completed')}</option>
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-secondary"
              onClick={onClose}
              disabled={loading}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="btn-modal-primary"
              disabled={loading}
            >
              {loading ? t('saving') : task ? t('save') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
