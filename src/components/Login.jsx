import React, { useState } from 'react';

const Login = ({ setToken }) => {
  // 1. States
  const [view, setView] = useState('login'); 
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', mobileNo: '', email: '', password: '', confirmPassword: '', otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Theme Colors
  const theme = {
    primaryOrange: '#cc5a27',
    bgDark: '#2c1e16',
    textDark: '#333333',
    textLight: '#8a827c',
    inputBorder: '#e6ded8',
  };

  // 3. Handlers
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

  // 4. Styles
  const inputStyle = {
    width: '100%', padding: '14px 14px 14px 40px', marginBottom: '15px', 
    border: `1px solid ${theme.inputBorder}`, borderRadius: '10px', 
    boxSizing: 'border-box', fontSize: '15px', outlineColor: theme.primaryOrange,
    color: theme.textDark, backgroundColor: '#fcfcfc'
  };

  // 5. Render
  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', 
      background: `radial-gradient(circle at 50% 30%, #4a3224 0%, #1f140e 100%)`, 
      fontFamily: 'sans-serif' 
    }}>
      
      <div style={{ 
        background: '#fffdfb', padding: '40px 35px', borderRadius: '20px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', width: '100%', maxWidth: '420px'
      }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ 
              width: '60px', height: '60px', backgroundColor: theme.primaryOrange, 
              borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
              margin: '0 auto 15px', color: 'white', fontSize: '30px' 
            }}>🍽️</div>
            <h1 style={{ color: theme.textDark, margin: '0 0 5px 0', fontSize: '24px' }}>TableOrder</h1>
            <p style={{ color: theme.textLight, margin: 0, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>Owner Portal</p>
        </div>

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={(e) => handleAction(e, 'login')}>
            <h2 style={{ textAlign: 'center', color: theme.textDark }}>Welcome Back!</h2>
            <div style={{ position: 'relative' }}>
              <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ position: 'relative' }}>
              <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', backgroundColor: theme.primaryOrange, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
              New here? <span onClick={() => setView('register')} style={{ color: theme.primaryOrange, cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</span>
            </p>
          </form>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <form onSubmit={(e) => handleAction(e, 'register')}>
            <div style={{ marginBottom: '15px', padding: '10px', border: `1px dashed ${theme.primaryOrange}`, borderRadius: '10px', textAlign: 'center' }}>
                <input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: '12px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input name="firstName" placeholder="First Name" onChange={handleChange} required style={{...inputStyle, paddingLeft: '14px'}} />
              <input name="lastName" placeholder="Last Name" onChange={handleChange} required style={{...inputStyle, paddingLeft: '14px'}} />
            </div>
            <input name="companyName" placeholder="Restaurant Name" onChange={handleChange} required style={{...inputStyle, paddingLeft: '14px'}} />
            <input name="mobileNo" placeholder="Mobile No." onChange={handleChange} required style={{...inputStyle, paddingLeft: '14px'}} />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={{...inputStyle, paddingLeft: '14px'}} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={{...inputStyle, paddingLeft: '14px'}} />
            <input name="confirmPassword" type="password" placeholder="Confirm" onChange={handleChange} required style={{...inputStyle, paddingLeft: '14px'}} />
            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: theme.primaryOrange, color: 'white', border: 'none', borderRadius: '10px' }}>Register</button>
            <p style={{ textAlign: 'center', marginTop: '10px' }} onClick={() => setView('login')}>Back</p>
          </form>
        )}

        {/* VERIFY VIEW */}
        {view === 'verify' && (
          <form onSubmit={(e) => handleAction(e, 'verify')} style={{ textAlign: 'center' }}>
            <h2>Verify Account</h2>
            <input name="otp" maxLength="4" placeholder="0000" onChange={handleChange} required style={{ width: '140px', fontSize: '28px', textAlign: 'center', padding: '10px', border: `2px solid ${theme.primaryOrange}`, borderRadius: '10px' }} />
            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: theme.primaryOrange, color: 'white', border: 'none', borderRadius: '10px', marginTop: '20px' }}>Verify</button>
          </form>
        )}

        {error && <div style={{ marginTop: '20px', color