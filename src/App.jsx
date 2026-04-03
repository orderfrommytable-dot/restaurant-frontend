import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- 1. Component Imports ---
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview'; // Your real SaaS Hub
import MenuBuilder from './components/MenuBuilder';

// --- 2. Page Placeholders (Keep these simple for now) ---
const KitchenDisplay = () => (
  <div style={{ padding: '50px', background: '#222', color: 'white', minHeight: '100vh' }}>
    <h2>👨‍🍳 Kitchen Live Orders</h2>
    <p>Orders will appear here in real-time once we connect Socket.io.</p>
  </div>
);

const CustomerMenu = () => (
  <div style={{ padding: '20px' }}>
    <h2>🍔 Digital Menu</h2>
    <p>This is what the customer sees after scanning the QR code.</p>
  </div>
);

// --- 3. Main App Component ---
const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ACCESS --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />} 
        />

        {/* --- CUSTOMER & KITCHEN (Independent Views) --- */}
        <Route path="/menu/:restaurantSlug/:tableNumber" element={<CustomerMenu />} />
        <Route path="/kitchen" element={<KitchenDisplay />} />

        {/* --- PROTECTED OWNER PORTAL (The SaaS Hub) --- */}
        {/* Everything inside here uses the Sidebar Layout */}
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

        {/* --- 404 SAFETY NET --- */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;