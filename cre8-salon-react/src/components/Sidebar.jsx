import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Calendar, DollarSign, 
  BarChart3, Scissors, Download, LogOut, UserCircle, ChevronDown, ChevronRight, Power, X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection, onLogout, onSwitchMode, isOpen, onClose }) => {
  const [expandedMenus, setExpandedMenus] = useState(['appointments-group']);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  // Close sidebar on mobile when navigation happens
  const handleNavClick = (id) => {
    setActiveSection(id);
    if (onClose) onClose();
  };

  const mainItems = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={18} /> },
    { id: 'payment', label: 'Sales', icon: <DollarSign size={18} /> },
    { 
      id: 'appointments-group', 
      label: 'Calendar', 
      icon: <Calendar size={18} />,
      children: [
        { id: 'calendar-view', label: 'Calendar View' },
        { id: 'appointments', label: 'Appointments List' }
      ]
    },
    { id: 'services', label: 'Services', icon: <Scissors size={18} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    { id: 'customers', label: 'Clients', icon: <Users size={18} /> },
  ];


  const renderNavItems = (items) => {
    return items.map(item => {
      if (item.children) {
        const isExpanded = expandedMenus.includes(item.id);
        const isActiveChild = item.children.some(child => child.id === activeSection);
        
        return (
          <li key={item.id} className="nav-group-wrapper">
            <button 
              className={`nav-link ${isActiveChild ? 'active-parent' : ''}`}
              onClick={() => toggleMenu(item.id)}
            >
              <div className="nav-link-content">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className={`nav-submenu ${isExpanded ? 'expanded' : ''}`}>
              <ul>
                {item.children.map(child => (
                  <li key={child.id}>
                    <button
                      className={`nav-link-child ${activeSection === child.id ? 'active' : ''}`}
                      onClick={() => handleNavClick(child.id)}
                    >
                      {child.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      }

      return (
        <li key={item.id}>
          <button 
            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <div className="nav-link-content">
              {item.icon}
              <span>{item.label}</span>
            </div>
          </button>
        </li>
      );
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="sidebar-logo" />
          {/* Close button - mobile only */}
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-label">MAIN MENU</p>
            <ul>
              {renderNavItems(mainItems)}
            </ul>
          </div>
          
        </nav>

        <div className="sidebar-footer">
          <div className="quick-actions-card">
            <button className="switch-btn" onClick={() => { onSwitchMode(); if (onClose) onClose(); }}>
              <UserCircle size={18} />
              <span>Switch to Customer</span>
            </button>
            <button className="logout-btn-outline" onClick={onLogout}>
              <Power size={14} strokeWidth={2.5} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Sidebar);
