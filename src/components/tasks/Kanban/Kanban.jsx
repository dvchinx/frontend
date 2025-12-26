import { useState, useEffect, useRef } from 'react';
import './Kanban.css';
import { getAllTasks, updateTask, deleteTask } from '../../../services/taskService';
import { useLanguage } from '../../../i18n/LanguageContext';
import TaskModal from '../TaskModal/TaskModal';
import ConfirmModal from '../../common/ConfirmModal/ConfirmModal';

function Kanban() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState({ TODO: [], IN_PROGRESS: [], DONE: [] });
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const result = await getAllTasks();
    
    if (result.success) {
      const categorizedTasks = {
        TODO: result.data.filter(task => task.status === 'TODO'),
        IN_PROGRESS: result.data.filter(task => task.status === 'IN_PROGRESS'),
        DONE: result.data.filter(task => task.status === 'DONE'),
      };
      setTasks(categorizedTasks);
    }
    
    setLoading(false);
  };

  const handleDragStart = (e, task) => {
    e.stopPropagation();
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    // Actualizar el estado localmente de inmediato para evitar parpadeo
    const oldStatus = draggedTask.status;
    const updatedTask = { ...draggedTask, status };
    
    setTasks(prevTasks => ({
      ...prevTasks,
      [oldStatus]: prevTasks[oldStatus].filter(t => t.id !== draggedTask.id),
      [status]: [...prevTasks[status], updatedTask]
    }));

    setDraggedTask(null);

    // Actualizar en el servidor en segundo plano
    const result = await updateTask(draggedTask.id, {
      title: draggedTask.title,
      description: draggedTask.description,
      status,
      priority: draggedTask.priority,
    });

    // Si falla, revertir y recargar
    if (!result.success) {
      loadTasks();
    }
  };

  const handleDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      const result = await deleteTask(taskToDelete);
      if (result.success) {
        loadTasks();
      }
    }
    setShowConfirmModal(false);
    setTaskToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setTaskToDelete(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleSaveTask = () => {
    loadTasks();
    handleCloseModal();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const columns = [
    { id: 'TODO', title: t('pending'), tasks: tasks.TODO },
    { id: 'IN_PROGRESS', title: t('inProgress'), tasks: tasks.IN_PROGRESS },
    { id: 'DONE', title: t('completed'), tasks: tasks.DONE },
  ];

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
    <div className="kanban-container">
      <div className="kanban-header">
        <h1 className="kanban-title">{t('taskManager')}</h1>
        <button className="btn-primary" onClick={handleCreateTask}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {t('newTask')}
        </button>
      </div>

      <div className="kanban-board">
        {columns.map((column) => (
          <div
            key={column.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header">
              <h2 className="column-title">{column.title}</h2>
              <span className="task-count">{column.tasks.length}</span>
            </div>

            <div className="tasks-list">
              {column.tasks.length === 0 ? (
                <div className="column-drop-zone">
                  Arrastra tareas aquí
                </div>
              ) : (
                column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <div className="task-card-header">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-actions">
                        <button
                          className="task-action-btn"
                          onClick={() => handleEditTask(task)}
                          title="Editar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="task-action-btn"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Eliminar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}

                    <div className="task-footer">
                      <span className={`task-priority ${task.priority.toLowerCase()}`}>
                        {t(task.priority.toLowerCase())}
                      </span>
                      <span className="task-date">{formatDate(task.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      )}

      {showConfirmModal && (
        <ConfirmModal
          title={t('deleteTask')}
          message={t('confirmDeleteTask')}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

export default Kanban;
