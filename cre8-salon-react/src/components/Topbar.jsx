import React, { useState, useEffect } from 'react';
import { Search, Bell, SlidersHorizontal, User, LogOut, Settings, Sun, Moon, Power, Menu } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ 
  user, onSearch, onLogout, isDarkMode, toggleDarkMode, onMenuToggle, 
  activeSection, searchTerm, notifications = [], markAllRead, setActiveSection 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowProfileMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (onSearch) onSearch(value);
  };

  const getPlaceholder = () => {
    switch (activeSection) {
      case 'dashboard': return 'Search Dashboard...';
      case 'customers': return 'Search Clients...';
      case 'appointments': return 'Search Appointments...';
      case 'services': return 'Search Services...';
      case 'payment': return 'Search Transactions...';
      case 'calendar-view': return 'Search Calendar...';
      default: return 'Search...';
    }
  };

  return (
    <div className="topbar">
      {/* Burger menu - mobile only */}
      <button className="topbar-burger" onClick={onMenuToggle} aria-label="Open menu">
        <Menu size={22} />
      </button>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder={getPlaceholder()} 
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="topbar-actions">
        {/* Dark Mode Toggle */}
        <button 
          className="shadow-round" 
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="topbar-item-wrapper">
          <button 
            type="button"
            className={`shadow-round ${showNotifications ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-dot"></span>}
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu topbar-dropdown" style={{ right: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <span onClick={() => markAllRead && markAllRead()}>Mark all as read</span>
                )}
              </div>
              <div className="dropdown-list">
                {notifications.length === 0 ? (
                  <div className="dropdown-item text-center py-24 text-muted">No new notifications</div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`dropdown-item ${!n.read ? 'unread' : ''}`} style={{ borderBottom: '1px solid var(--border)', borderRadius: 0 }}>
                      <div className="item-content">
                        <p className="item-title">{n.title}</p>
                        <p className="item-desc">{n.desc}</p>
                        <span className="item-time">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div 
                className="dropdown-footer" 
                onClick={() => {
                  if (setActiveSection) setActiveSection('notifications');
                  setShowNotifications(false);
                }}
              >
                View All Notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar-profile-wrapper">
          <div 
            className="topbar-profile"
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
          >
            <div className="topbar-profile-info">
              <span className="topbar-profile-name">{user?.name || 'Staff'}</span>
              <span className="topbar-profile-role">Staff</span>
            </div>
            <div className="topbar-avatar">
              <User size={18} />
            </div>
          </div>

          {showProfileMenu && (
            <div className="dropdown-menu" style={{ top: 'calc(100% + 12px)', right: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-list">
                <div className="dropdown-item clickable" onClick={() => { if (setActiveSection) setActiveSection('profile'); setShowProfileMenu(false); }}>
                  <User size={16} />
                  <span>My Profile</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item clickable text-danger" onClick={onLogout}>
                  <Power size={16} />
                  <span>Sign Out</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Topbar);
