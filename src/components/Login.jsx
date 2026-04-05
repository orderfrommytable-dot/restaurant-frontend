import React, { useState } from 'react';
import './Login.css';

const Login = ({ setToken }) => {
  const [view, setView] = useState('login'); 
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', mobileNo: '', email: '', password: '', confirmPassword: '', otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = {
    orange: '#cc5a27',
    dark: '#2c1e16',
    border: '#e6ded8'
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async (e, type) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = type === 'login' ? '/auth/login' : type === 'register' ? '/auth/register' : '/auth/verify';
    
    if (type === 'register' && formData.password !== formData.confirmPassword) {
      setLoading(false);
      return setError("Passwords do not match");
    }

    // --- THE FIX: Clean Payload Construction ---
    // We only send the exact data the database expects for each action.
    let payload = {};
    if (type === 'register') {
      payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        mobileNo: formData.mobileNo,
        email: formData.email,
        password: formData.password
      };
    } else if (type === 'login') {
      payload = {
        email: formData.email,
        password: formData.password
      };
    } else if (type === 'verify') {
      payload = {
        email: formData.email,
        otp: formData.otp
      };
    }

    try {
      const res = await fetch(`https://restaurant-saas-j7ed.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) // <-- Sending the clean payload here
      });
      const data = await res.json();
      
      if (data.success) {
        if (type === 'register') setView('verify');
        else if (type === 'verify' || type === 'login') {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
      } else {
        console.error("Backend Error Details:", data); // Prints exact error to console
        setError(data.message || "Action failed");
      }
    } catch (err) {
      console.error("Network Fetch Error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { width: '100%', padding: '12px', marginBottom: '10px', border: `1px solid ${theme.border}`, borderRadius: '8px', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: theme.dark, fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '50px', height: '50px', background: theme.orange, borderRadius: '12px', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>🍽️</div>
          <h1 style={{ margin: 0, fontSize: '22px' }}>TableOrder</h1>
        </div>

        {view === 'login' && (
          <form onSubmit={(e) => handleAction(e, 'login')}>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={fieldStyle} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={fieldStyle} />
            <button type="submit" disabled={loading} className="action-btn">
              {loading ? <><div className="spinner"></div> Processing...</> : 'Log In'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '14px' }}>New? <span onClick={() => setView('register')} style={{ color: theme.orange, cursor: 'pointer' }}>Sign Up</span></p>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={(e) => handleAction(e, 'register')}>
            <input type="file" onChange={handleLogoChange} style={{ marginBottom: '10px', fontSize: '12px' }} />
            {logoPreview && <img src={logoPreview} alt="p" style={{ width: '50px', display: 'block', margin: '0 auto 10px' }} />}
            <input name="firstName" placeholder="First Name" onChange={handleChange} required style={fieldStyle} />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} required style={fieldStyle} />
            <input name="companyName" placeholder="Restaurant Name" onChange={handleChange} required style={fieldStyle} />
            <input name="mobileNo" placeholder="Mobile" onChange={handleChange} required style={fieldStyle} />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={fieldStyle} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={fieldStyle} />
            <input name="confirmPassword" type="password" placeholder="Confirm" onChange={handleChange} required style={fieldStyle} />
            <button type="submit" disabled={loading} className="action-btn">
              {loading ? <><div className="spinner"></div> Registering...</> : 'Register'}
            </button>
            <p onClick={() => setView('login')} style={{ textAlign: 'center', cursor: 'pointer', fontSize: '12px' }}>Back</p>
          </form>
        )}

        {view === 'verify' && (
          <form onSubmit={(e) => handleAction(e, 'verify')} style={{ textAlign: 'center' }}>
            <input name="otp" maxLength="4" placeholder="0000" onChange={handleChange} required style={{ fontSize: '24px', textAlign: 'center', width: '100px', marginBottom: '20px' }} />
            <button type="submit" disabled={loading} className="action-btn">
              {loading ? <><div className="spinner"></div> Verifying...</> : 'Verify'}
            </button>
          </form>
        )}

        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '12px' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;