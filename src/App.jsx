import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- 1. Component Imports ---
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview'; // Your real SaaS Hub
import MenuBuilder from './components/MenuBuilder';
import KitchenDisplay from './components/KitchenDisplay'; // New real kitchen!
import CustomerMenu from './components/CustomerMenu';     // New customer menu!

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

        {/* --- CUSTOMER PUBLIC --- */}
        <Route path="/menu/:restaurantSlug/:tableNumber" element={<CustomerMenu />} />

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
          path="/dashboard/menu/:restaurantId" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MenuBuilder />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Note: Kitchen doesn't need the Sidebar Layout, it's a fullscreen view */}
        <Route 
          path="/dashboard/kitchen/:restaurantId" 
          element={
            <ProtectedRoute>
              <KitchenDisplay />
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