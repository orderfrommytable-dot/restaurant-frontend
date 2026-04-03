import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Import your components ---
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

// --- Temporary Placeholders for the 3 Journeys ---
const OwnerDashboard = () => <div style={{ padding: '50px' }}><h2>👑 Owner Dashboard</h2><button onClick={() => {localStorage.removeItem('token'); window.location.href='/login'}}>Logout</button></div>;
const KitchenDisplay = () => <div style={{ padding: '50px', background: '#222', color: 'white', minHeight: '100vh' }}><h2>👨‍🍳 Kitchen Live Orders</h2></div>;
const CustomerMenu = () => <div style={{ padding: '20px' }}><h2>🍔 Digital Menu (No Login Required)</h2><p>Ordering for Table 4</p></div>;

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        {/* --- 1. THE OPEN ROUTES (Guests & Public) --- */}
        {/* If someone just goes to yourwebsite.com, send them to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />} 
        />

        {/* The QR Code Link: e.g., yoursite.com/menu/burger-joint/table-4 */}
        <Route path="/menu/:restaurantSlug/:tableNumber" element={<CustomerMenu />} />


        {/* --- 2. THE KITCHEN ROUTE (Low Friction Auth) --- */}
        <Route path="/kitchen" element={<KitchenDisplay />} />


        {/* --- 3. THE OWNER PORTAL (Strict Auth) --- */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <OwnerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all for broken links */}
        <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  );
};

export default App;