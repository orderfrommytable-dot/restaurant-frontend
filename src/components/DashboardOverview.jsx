import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback to production if env var is missing
  const API_URL = import.meta.env.VITE_API_URL || "https://restaurant-saas-j7ed.onrender.com";
  // The frontend public URL where the QR code will direct users
  const FRONTEND_URL = window.location.origin;

  const fetchMyRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setRestaurants(data.data);
      }
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  const handleCreateRestaurant = async () => {
    const name = window.prompt("Enter the name of your new restaurant:");
    if (!name) return;

    try {
      const response = await fetch(`${API_URL}/restaurants`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ name })
      });
      const data = await response.json();
      if (data.success) {
        fetchMyRestaurants();
      } else {
        alert("Failed to create restaurant: " + data.message);
      }
    } catch (err) {
      console.error("Create error", err);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading your dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#2c1e16', margin: 0 }}>Your Restaurants</h2>
        {restaurants.length > 0 && (
          <button onClick={handleCreateRestaurant} style={buttonStyle}>+ Create Another Restaurant</button>
        )}
      </div>
      
      {restaurants.length === 0 ? (
        <div style={cardStyle}>
          <p>You haven't created a restaurant yet!</p>
          <button onClick={handleCreateRestaurant} style={buttonStyle}>+ Create First Restaurant</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {restaurants.map(r => {
            const qrUrl = `${FRONTEND_URL}/menu/${r.slug}/1`; // table 1 default for demo
            
            return (
              <div key={r.id} style={cardStyle}>
                <h3 style={{ margin: '0 0 15px 0', color: '#cc5a27' }}>{r.name}</h3>
                <div style={{ background: 'white', padding: '15px', borderRadius: '10px', display: 'inline-block' }}>
                  <QRCodeSVG value={qrUrl} size={150} />
                </div>
                <p style={{ fontSize: '14px', color: '#666', margin: '15px 0' }}>
                  Slug: <strong>{r.slug}</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <div style={{ display: 'flex', gap: '10px' }}>
                     <Link to={`/dashboard/menu/${r.id}`} style={linkButtonStyle}>Manage Menu</Link>
                     <Link to={`/dashboard/kitchen/${r.id}`} style={linkButtonStyle}>Live Kitchen</Link>
                   </div>
                   <a href={qrUrl} target="_blank" rel="noreferrer" style={{...linkButtonStyle, background: '#cc5a27', color: 'white'}}>Preview Customer View (QR Link)</a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Styles
const cardStyle = { background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' };
const buttonStyle = { padding: '10px 20px', background: '#cc5a27', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const linkButtonStyle = { flex: 1, textDecoration: 'none', padding: '8px', background: '#f5f0eb', color: '#2c1e16', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold' };

export default DashboardOverview;