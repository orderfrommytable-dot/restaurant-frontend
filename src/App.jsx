import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- 1. Component Imports ---
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import MenuBuilder from './components/MenuBuilder';

// --- 2. Page Placeholders ---
const DashboardOverview = () => (
  <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
    <h2 style={{ color: '#2c1e16' }}>Welcome back! 👋</h2>
    <p style={{ color: '#666' }}>Check your live orders or update your menu using the sidebar.</p>
  </div>
);

const KitchenDisplay = () => (
  <div style={{ padding: '50px', background: '#222', color: 'white', minHeight: '100vh' }}>
    <h2>👨‍🍳 Kitchen Live Orders</h2>
    <p>Orders will appear here in real-time.</p>
  </div>
);

const CustomerMenu = () => (
  <div style={{ padding: '20px' }}>
    <h2>🍔 Digital Menu</h2>
    <p>Browsing menu for Table 4</p>
  </div>
);

// --- 3. Main App Component ---
const App = () => {
  // Pull the token to check if user is already logged in
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />} 
        />

        {/* --- CUSTOMER & KITCHEN (No Sidebar) --- */}
        <Route path="/menu/:restaurantSlug/:tableNumber" element={<CustomerMenu />} />
        <Route path="/kitchen" element={<KitchenDisplay />} />

        {/* --- PROTECTED OWNER ROUTES (With Sidebar Layout) --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardOverview />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/menu" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MenuBuilder />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* --- CATCH-ALL --- */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;