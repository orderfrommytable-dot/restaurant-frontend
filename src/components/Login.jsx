import React, { useState } from 'react';

const Login = ({ setToken }) => {
  const [view, setView] = useState('login'); 
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', mobileNo: '', email: '', password: '', confirmPassword: '', otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Theme Colors based on your elegant design
  const theme = {
    primaryOrange: '#cc5a27', // The burnt orange from the button
    bgDark: '#2c1e16',        // The moody restaurant background
    textDark: '#333333',
    textLight: '#8a827c',
    inputBorder: '#e6ded8',
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(file);
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleAction = async (e, type) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    let endpoint = type === 'login' ? '/auth/login' : type === 'register' ? '/auth/register' : '/auth/verify';
    
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
        if (type === 'register') setView('verify');
        else if (type === 'verify' || type === 'login') {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
      } else {
        setError(data.message || "Action failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Shared Input Style to match the elegant theme
  const inputStyle = {
    width: '100%', padding: '14px 14px 14px 40px', marginBottom: '15px', 
    border: `1px solid ${theme.inputBorder}`, borderRadius: '10px', 
    boxSizing: 'border-box', fontSize: '15px', outlineColor: theme.primaryOrange,
    color: theme.textDark, backgroundColor: '#fcfcfc'
  };

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', 
      // Moody restaurant radial gradient background
      background: `radial-gradient(circle at 50% 30%, #4a3224 0%, #1f140e 100%)`, 
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
    }}>
      
      <div style={{ 
        background: '#fffdfb', padding: '40px 35px', borderRadius: '20px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', width: '100%', maxWidth: '420px',
        position: 'relative', zIndex: 10
      }}>
        
        {/* --- HEADER (LOGO & BRANDING) --- */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ 
              width: '60px', height: '60px', backgroundColor: theme.primaryOrange, 
              borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
              margin: '0 auto 15px', color: 'white', fontSize: '30px' 
            }}>
               🍽️ {/* Placeholder for the Fork/Knife icon */}
            </div>
            <h1 style={{ color: theme.textDark, margin: '0 0 5px 0', fontSize: '24px', fontWeight: '600' }}>TableOrder</h1>
            <p style={{ color: theme.textLight, margin: 0, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>Owner Portal</p>
        </div>

        {/* --- LOGIN VIEW --- */}
        {view === 'login' && (
          <form onSubmit={(e) => handleAction(e, 'login')}>
            <h2 style={{ textAlign: 'center', color: theme.textDark, fontSize: '22px', marginBottom: '5px' }}>Welcome Back!</h2>
            <p style={{ textAlign: 'center', color: theme.textLight, fontSize: '14px', marginBottom: '25px' }}>Log in to manage your restaurant orders</p>
            
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.4 }}>✉️</span>
              <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required style={inputStyle} />
            </div>
            
            <div style={{ position: 'relative', marginBottom: '5px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '14px', opacity: 0.4 }}>🔒</span>
              <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
            </div>
            
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <span style={{ color: theme.primaryOrange, fontSize: '13px', cursor: 'pointer' }}>Forgot password?</span>
            </div>

            <button type="submit" disabled={loading} style={{ 
              width: '100%', padding: '15px', backgroundColor: theme.primaryOrange, color: 'white', 
              border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '16px',
              boxShadow: '0 4px 10px rgba(204, 90, 39, 0.3)'
            }}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0', color: theme.inputBorder }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: theme.inputBorder }}></div>
              <span style={{ margin: '0 15px', color: theme.textLight, fontSize: '14px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: theme.inputBorder }}></div>
            </div>

            <button type="button" onClick={() => alert("Google Auth coming soon!")} style={{ 
              width: '100%', padding: '14px', backgroundColor: 'transparent', color: theme.textDark, 
              border: `1px solid ${theme.inputBorder}`, borderRadius: '10px', fontWeight: '500', 
              cursor: 'pointer', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'