import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Sun, Moon, Loader2 } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin, isDarkMode, toggleDarkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0: auth, 1: init
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsAuthenticating(true);
    
    // Stage 1: Authenticating (1.2s)
    setTimeout(() => {
      setLoadingStep(1);
      
      // Stage 2: Initializing (1.3s)
      setTimeout(() => {
        onLogin({ name: name || 'Zachary', email });
      }, 1300);
    }, 1200);
  };

  if (isAuthenticating) {
    return (
      <div className="login-wrapper portal-init-mode">
        <div className="aurora-bg-container">
          <div className="aurora-blob aurora-1"></div>
          <div className="aurora-blob aurora-2"></div>
          <div className="aurora-blob aurora-3"></div>
        </div>
        
        <div className="portal-loading-content">
          <div className="portal-logo-pulse">
            <img src="/logo.png" alt="Logo" className="portal-logo-large" />
          </div>
          
          <div className="portal-status-container">
            <div className="portal-status-text">
              {loadingStep === 0 ? 'Authenticating Staff Credentials...' : 'Initializing Secure Workspace...'}
            </div>
            <div className="portal-progress-bg">
              <div className={`portal-progress-fill ${loadingStep === 1 ? 'complete' : ''}`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="aurora-bg-container">
        <div className="aurora-blob aurora-1"></div>
        <div className="aurora-blob aurora-2"></div>
        <div className="aurora-blob aurora-3"></div>
      </div>
      
      <div className="auth-header-top">
        <img src="/logo.png" alt="Logo" className="auth-logo-fixed" />
      </div>

      <button className="login-theme-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="login-split-container">
        <div className="login-left-branding">
          <div className="left-photo-overlay"></div>
          <div className="branding-content">
            <div className="branding-tagline">Est. 2020 · Premium Salon</div>
            <h1 className="branding-hero-title">Beauty in<br />Every Detail</h1>
            <p className="branding-hero-subtitle">Your look. Your story. Perfected.</p>

            <div className="branding-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Happy Clients</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">Expert Services</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">5★</span>
                <span className="stat-label">Rated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right-form">
          <div className="glass-card">
            <div className="auth-form">
              <h2 className="form-title">Staff Portal</h2>
              <p className="form-subtitle">Welcome back! Please enter your details.</p>

              <div className={`auth-tabs ${isRegister ? 'register-active' : 'login-active'}`}>
                <button 
                  type="button" 
                  className={`tab-btn ${!isRegister ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                  }}
                >
                  Login
                </button>
                <button 
                  type="button" 
                  className={`tab-btn ${isRegister ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegister(true);
                    setError('');
                  }}
                >
                  Register
                </button>
                <div className="tab-indicator"></div>
              </div>

              {error && <div className="auth-error-msg">{error}</div>}

              <div className="auth-form-content">
                {!isRegister ? (
                  /* ─── SIGN IN ─── */
                  <form 
                    key="login-form" 
                    onSubmit={handleSubmit}
                  >
                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>

                    <div className="form-options">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={keepLoggedIn}
                          onChange={(e) => setKeepLoggedIn(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Remember me
                      </label>
                      <button type="button" className="ghost-link">Forgot password?</button>
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit" disabled={isAuthenticating}>
                      Sign In
                    </button>
                  </form>
                ) : (
                  /* ─── SIGN UP ─── */
                  <form 
                    key="register-form" 
                    onSubmit={handleSubmit}
                  >
                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Confirm Password</label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex="-1"
                      >
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit" disabled={isAuthenticating}>
                      Create Account
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Login);
