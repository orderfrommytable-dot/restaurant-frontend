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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- LOGO UPLOAD HANDLER ---
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

  // --- AUTHENTICATION HANDLER ---
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
      // NOTE: We are only sending text data to Render right now. Logo storage comes next!
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' }}>
      
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#1a1a1a', margin: '0 0 10px 0', fontSize: '24px' }}>🍽️ Restaurant OS</h1>
            <p style={{ color: '#666', margin: 0 }}>Manage your digital storefront</p>
        </div>

        {/* --- LOGIN VIEW --- */}
        {view === 'login' && (
          <form onSubmit={(e) => handleAction(e, 'login')}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>Email Address</label>
              <input name="email" type="email" placeholder="owner@restaurant.com" onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '14px' }}>Password</label>
              <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>New here? <span onClick={() => setView('register')} style={{ color: '#f39c12', cursor: 'pointer', fontWeight: 'bold' }}>Sign up</span></p>
          </form>
        )}

        {/* --- REGISTER VIEW (With Logo Upload) --- */}
        {view === 'register' && (
          <form onSubmit={(e) => handleAction(e, 'register')}>
            
            {/* Logo Upload Box */}
            <div style={{ marginBottom: '20px', padding: '15px', border: '2px dashed #ddd', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>Upload Restaurant Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: '12px' }} />
                {logoPreview && (
                    <img src={logoPreview} alt="Preview" style={{ display: 'block', margin: '10px auto 0', maxWidth: '100px', borderRadius: '8px' }} />
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input name="firstName" placeholder="First Name" onChange={handleChange} required style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              <input name="lastName" placeholder="Last Name" onChange={handleChange} required style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <input name="companyName" placeholder="Restaurant Name" onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            <input name="mobileNo" placeholder="Mobile Number" onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            <input name="password" type="password" placeholder="Create Password" onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}><span onClick={() => setView('login')} style={{ color: '#666', cursor: 'pointer' }}>← Back to login</span></p>
          </form>
        )}

        {/* --- VERIFY VIEW --- */}
        {view === 'verify' && (
          <form onSubmit={(e) => handleAction(e, 'verify')} style={{ textAlign: 'center' }}>
            <h2>Verify Email</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Enter the 4-digit code sent to {formData.email}</p>
            <input name="otp" maxLength="4" placeholder="0000" onChange={handleChange} required style={{ width: '120px', fontSize: '24px', letterSpacing: '8px', textAlign: 'center', padding: '10px', border: '2px solid #f39c12', borderRadius: '8px', marginBottom: '20px' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Verify Account
            </button>
          </form>
        )}

        {error && <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '6px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
      </div>
    </div>
  );
};

export default Login;