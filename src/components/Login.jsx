import React, { useState } from 'react';
import './Login.css';

const Login = ({ setToken }) => {
  const [view, setView] = useState('login'); // 'login', 'register', or 'verify'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '', // Matches Schema
    mobileNo: '',    // Matches Schema
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAction = async (e, type) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    let endpoint = type === 'login' ? '/auth/login' : type === 'register' ? '/auth/register' : '/auth/verify';
    
    // Validation for registration
    if (type === 'register' && formData.password !== formData.confirmPassword) {
      setLoading(false);
      return setError("Passwords do not match");
    }

    try {
      const res = await fetch(`https://restaurant-saas-j7ed.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (data.success) {
        if (type === 'register') {
          setView('verify');
        } else if (type === 'verify' || type === 'login') {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Server is waking up... please try again in 30 seconds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo-text">🍽️ Restaurant OS</h1>

        {/* --- LOGIN VIEW --- */}
        {view === 'login' && (
          <>
            <h2>Log in to your account</h2>
            <button className="social-btn google" type="button">Continue with Google</button>
            <button className="social-btn email-btn" type="button" onClick={() => document.getElementById('email-input').focus()}>
              Sign in with Email address
            </button>
            <div className="divider"><span>OR</span></div>
            <form onSubmit={(e) => handleAction(e, 'login')}>
              <input 
                id="email-input"
                name="email" 
                type="email" 
                placeholder="Email" 
                onChange={handleChange} 
                required 
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required 
              />
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            <p className="toggle-text">New here? <span onClick={() => setView('register')}>Sign up</span></p>
          </>
        )}

        {/* --- REGISTER VIEW --- */}
        {view === 'register' && (
          <>
            <h2>Create your Admin Account</h2>
            <form onSubmit={(e) => handleAction(e, 'register')} className="register-form">
              <div className="input-row">
                <input name="firstName" placeholder="First Name" onChange={handleChange} required />
                <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
              </div>
              <input name="companyName" placeholder="Company Name" onChange={handleChange} required />
              <input name="mobileNo" placeholder="Mobile No." onChange={handleChange} required />
              <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
              <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
            <p className="toggle-text">Already have an account? <span onClick={() => setView('login')}>Log in</span></p>
          </>
        )}

        {/* --- VERIFY VIEW (OTP) --- */}
        {view === 'verify' && (
          <>
            <h2>Verify your Email</h2>
            <p className="verify-subtext">Enter the 4-digit security code sent to <strong>{formData.email}</strong></p>
            <form onSubmit={(e) => handleAction(e, 'verify')}>
              <input 
                name="otp" 
                className="otp-input" 
                maxLength="4" 
                placeholder="0000" 
                onChange={handleChange} 
                autoFocus
                required 
              />
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
            </form>
            <p className="toggle-text" style={{cursor: 'pointer'}} onClick={() => setView('register')}>← Back to registration</p>
          </>
        )}

        {error && <div className="error-badge">{error}</div>}
      </div>
    </div>
  );
};

export default Login;