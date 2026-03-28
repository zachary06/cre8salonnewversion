import React, { useState } from 'react';
import { User, Mail, Camera, Save, LogOut, Key, Bell, CreditCard } from 'lucide-react';
import './Profile.css';

const Profile = ({ currentUser, setCurrentUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Staff User',
    email: currentUser?.email || 'staff@cre8salon.com',
    phone: currentUser?.phone || '+63 912 345 6789',
    role: currentUser?.role || 'Staff',
    bio: 'Professional Salon Staff with a passion for beauty and customer care.'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUser = { ...currentUser, ...formData };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setIsEditing(false);
    // In a real app, you'd call an API here
  };

  return (
    <div className="profile-container">
      <div className="profile-header-section card">
        <div className="profile-info-main">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <User size={48} />
              <button className="avatar-edit-btn"><Camera size={16} /></button>
            </div>
          </div>
          <div className="profile-title-details">
            <h1 className="profile-name">{formData.name}</h1>
            <p className="profile-role-badge">
              Staff
            </p>
          </div>
          <div className="profile-actions-top">
            {isEditing ? (
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={18} /> Save Changes
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-left-col">
          <div className="card profile-nav-card shadow-sm">
            <ul className="profile-nav-list">
              <li className="active"><User size={18} /> Personal Info</li>
              <li><Key size={18} /> Security</li>
              <li><Bell size={18} /> Notifications</li>
              <li><CreditCard size={18} /> Billing</li>
            </ul>
            <div className="divider"></div>
            <button className="profile-logout-btn" onClick={onLogout}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        <div className="profile-right-col">
          <div className="card profile-details-card shadow-sm">
            <h3 className="card-title mb-24">Account Settings</h3>
            
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="profile-name">Full Name</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input 
                      type="text" 
                      id="profile-name"
                      name="name"
                      value={formData.name} 
                      onChange={handleChange}
                      disabled={!isEditing} 
                      autoComplete="name"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="profile-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input 
                      type="email" 
                      id="profile-email"
                      name="email"
                      value={formData.email} 
                      onChange={handleChange}
                      disabled={!isEditing} 
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="profile-phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="profile-phone"
                    name="phone"
                    value={formData.phone} 
                    onChange={handleChange}
                    disabled={!isEditing} 
                    autoComplete="tel"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-role">Workspace Role</label>
                  <input 
                    type="text" 
                    id="profile-role"
                    name="role"
                    value="Staff" 
                    disabled 
                    autoComplete="organization-title"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="profile-bio">Professional Bio</label>
                <textarea 
                  id="profile-bio"
                  name="bio"
                  value={formData.bio} 
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  autoComplete="off"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="card profile-security-card shadow-sm mt-24">
            <h3 className="card-title mb-16">Security & Privacy</h3>
            <p className="text-muted mb-24" style={{fontSize: '14px'}}>
              Update your password and manage two-factor authentication to keep your account secure.
            </p>
            <button className="btn btn-secondary">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
