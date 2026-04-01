import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // Check for existing session
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Handle Logout
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    window.location.href = '/'; // Reset the URL to clear any menu/table params
  };

  // Check if we are a customer looking at a menu
  const queryParams = new URLSearchParams(window.location.search);
  const customerSlug = queryParams.get('menu');

  // If a customer is scanning, we don't show login, we show the menu
  if (customerSlug) {
    return <Dashboard customerSlug={customerSlug} isCustomer={true} />;
  }

  return (
    <div className="app-shell">
      {!token ? (
        <Login setToken={(t) => {
          setToken(t);
          localStorage.setItem('token', t);
        }} />
      ) : (
        <Dashboard token={token} handleLogout={handleLogout} isCustomer={false} />
      )}
    </div>
  );
}

export default App;