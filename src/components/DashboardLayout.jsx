import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f0eb' }}>
      {/* --- SIDEBAR --- */}
      <div style={{ width: '260px', background: '#1f150f', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '30px 20px', borderBottom: '1px solid #2c1e16' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#cc5a27' }}>🍽️ TableOrder</h2>
        </div>

        <nav style={{ flex: 1, padding: '20px' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '15px' }}>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>📊 Overview (Select Restaurant)</Link>
            </li>
          </ul>
        </nav>

        <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <header style={headerStyle}>
          <h3 style={{ margin: 0 }}>Admin Panel</h3>
        </header>
        <main style={{ padding: '40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const logoutButtonStyle = { margin: '20px', padding: '10px', background: 'transparent', border: '1px solid #cc5a27', color: '#cc5a27', cursor: 'pointer', borderRadius: '8px' };
const headerStyle = { padding: '20px 40px', background: 'white', borderBottom: '1px solid #e6ded8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

export default DashboardLayout;