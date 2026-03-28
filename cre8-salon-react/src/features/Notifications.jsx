import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Calendar, DollarSign, Info, AlertCircle, Star } from 'lucide-react';
import './Notifications.css';

const Notifications = ({ notifications, markRead, markAllRead, clearNotification, searchTerm = '' }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    // Tab filter
    if (activeTab === 'unread' && n.read) return false;
    if (activeTab === 'read' && !n.read) return false;
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return n.title.toLowerCase().includes(search) || n.desc.toLowerCase().includes(search);
    }
    
    return true;
  });

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('appointment')) return <Calendar size={20} />;
    if (t.includes('payment')) return <DollarSign size={20} />;
    if (t.includes('alert') || t.includes('low')) return <AlertCircle size={20} />;
    if (t.includes('feedback') || t.includes('review')) return <Star size={20} />;
    return <Info size={20} />;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header flex-between">
        <div>
          <h1 className="section-title">Notifications</h1>
        </div>
        <div className="flex gap-12">
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>
              <CheckCheck size={16} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      <div className="notifications-tabs">
        <button 
          className={`nav-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Notifications
          <span className="notification-count">{notifications.length}</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread
          <span className="notification-count">{unreadCount}</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'read' ? 'active' : ''}`}
          onClick={() => setActiveTab('read')}
        >
          Read
          <span className="notification-count">{notifications.length - unreadCount}</span>
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="card notifications-empty">
            <Bell size={48} className="text-muted" strokeWidth={1.5} />
            <p>No notifications found in this category.</p>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div key={n.id} className={`card notification-item-card ${!n.read ? 'unread' : ''}`}>
              <div className="notification-icon-wrapper">
                {getIcon(n.title)}
              </div>
              <div className="notification-main">
                <div className="notification-title-row">
                  <h3 className="notification-item-title">{n.title}</h3>
                  <span className="notification-time">{n.time}</span>
                </div>
                <p className="notification-description">{n.desc}</p>
                <div className="notification-actions">
                  {!n.read && (
                    <button className="action-link" onClick={() => markRead(n.id)}>
                      Mark as read
                    </button>
                  )}
                  <button className="action-link secondary" onClick={() => clearNotification(n.id)}>
                    <Trash2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(Notifications);
