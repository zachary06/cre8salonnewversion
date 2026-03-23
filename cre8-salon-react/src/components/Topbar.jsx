import React, { useState, useEffect } from 'react';
import { Search, Bell, SlidersHorizontal, User, LogOut, Settings, Sun, Moon, Power, Menu } from 'lucide-react';
import './Topbar.css';

const notifications = [
  { id: 1, title: 'New Appointment', desc: 'Jenny Wilson booked a Haircut', time: '5m ago' },
  { id: 2, title: 'Payment Received', desc: '$80.00 for Facial Treatment', time: '1h ago' },
  { id: 3, title: 'Schedule Update', desc: 'New staff shift assigned', time: '2h ago' },
];

const Topbar = ({ user, onSearch, onLogout, isDarkMode, toggleDarkMode, onMenuToggle, activeSection, searchTerm }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
            <span className="notification-dot"></span>
          </button>
          
          {showNotifications && (
            <div className="dropdown-menu" style={{ top: 'calc(100% + 12px)', right: 0, width: '320px', padding: '16px 0' }} onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-header px-16 mb-12 flex-between">
                <h3 className="text-sm font-bold">Notifications</h3>
                <span className="text-xs text-primary cursor-pointer">Mark all as read</span>
              </div>
              <div className="dropdown-list">
                {notifications.map(n => (
                  <div key={n.id} className="dropdown-item no-hover-bg" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', borderRadius: 0 }}>
                    <div className="item-content">
                      <p className="font-bold text-sm mb-2">{n.title}</p>
                      <p className="text-xs text-muted leading-relaxed line-clamp-2">{n.desc}</p>
                      <span className="text-xs font-medium text-primary mt-4 block">{n.time}</span>
                    </div>
                  </div>
                ))}
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
            <div className="profile-info">
              <span className="profile-name">{user?.name || 'Administrator'}</span>
              <span className="profile-role">Staff</span>
            </div>
            <div className="profile-avatar">
              <User size={20} />
            </div>
          </div>

          {showProfileMenu && (
            <div className="dropdown-menu" style={{ top: 'calc(100% + 12px)', right: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-list">
                <div className="dropdown-item clickable">
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
