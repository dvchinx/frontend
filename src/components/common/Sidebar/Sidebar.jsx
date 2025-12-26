import React from 'react';
import './Sidebar.css';
import JFLogo from '../../../assets/JF_Logo.svg';
import ChatIcon from '../../../assets/Chat_Icon.svg';
import ImageIcon from '../../../assets/Image_Icon.svg';
import KanbanIcon from '../../../assets/Kanban_Icon.svg';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';

const Sidebar = ({ currentView, onViewChange, user, onLogout, onViewProfile }) => {
  const menuItems = [
    { id: 'chat', icon: ChatIcon, label: 'Chat' },
    { id: 'editor', icon: ImageIcon, label: 'Editor' },
    { id: 'kanban', icon: KanbanIcon, label: 'Tareas' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={JFLogo} alt="JF Logo" />
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            aria-label={item.label}
          >
            <img src={item.icon} alt="" className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-profile">
        <ProfileDropdown 
          user={user} 
          onLogout={onLogout}
          onViewProfile={onViewProfile}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
