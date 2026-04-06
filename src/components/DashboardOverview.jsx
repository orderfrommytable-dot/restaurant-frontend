import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.PROD ? "https://restaurant-saas-j7ed.onrender.com" : "http://localhost:5000";
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

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', openingTime: '', closingTime: '', numberOfTables: 1 });

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const response = await fetch(`${API_URL}/restaurants`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ name: '', location: '', openingTime: '', closingTime: '', numberOfTables: 1 });
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
        {restaurants.length > 0 && !showForm && (
          <button onClick={() => setShowForm(true)} style={buttonStyle}>+ Create Another Restaurant</button>
        )}
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '20px', textAlign: 'left', border: '2px solid #cc5a27' }}>
          <h3 style={{ marginTop: 0, color: '#cc5a27' }}>New Restaurant Setup</h3>
          <form onSubmit={handleCreateRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input placeholder="Restaurant Name (Required)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            <input placeholder="Location e.g. New York, NY" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={inputStyle} />
            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="time" title="Opening Time" value={formData.openingTime} onChange={e => setFormData({...formData, openingTime: e.target.value})} style={{ ...inputStyle, flex: 1 }} />
              <input type="time" title="Closing Time" value={formData.closingTime} onChange={e => setFormData({...formData, closingTime: e.target.value})} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Number of Tables (for QR generation)</label>
            <input type="number" min="1" max="100" required value={formData.numberOfTables} onChange={e => setFormData({...formData, numberOfTables: e.target.value})} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={buttonStyle}>Launch Restaurant</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...buttonStyle, background: '#e6ded8', color: '#2c1e16' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      {restaurants.length === 0 && !showForm ? (
        <div style={cardStyle}>
          <p>You haven't created a restaurant yet!</p>
          <button onClick={() => setShowForm(true)} style={buttonStyle}>+ Create First Restaurant</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {restaurants.map(r => {
            const numTables = r.numberOfTables || 1;
            const tablesArray = Array.from({ length: numTables }, (_, i) => i + 1);

            return (
              <div key={r.id} style={{ ...cardStyle, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#cc5a27', fontSize: '22px' }}>{r.name}</h3>
                    {r.location && <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>📍 {r.location}</p>}
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Tables: <strong>{numTables}</strong></p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/dashboard/menu/${r.id}`} style={linkButtonStyle}>🍔 Manage Menu</Link>
                    <Link to={`/dashboard/kitchen/${r.id}`} style={{ ...linkButtonStyle, background: '#1ed760', color: 'black' }}>👨‍🍳 Live Kitchen</Link>
                  </div>
                </div>

                <h4 style={{ margin: '0 0 15px 0', color: '#2c1e16' }}>Table QR Codes</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
                  {tablesArray.map(tableNum => {
                    const qrUrl = `${FRONTEND_URL}/menu/${r.slug}/${tableNum}`;
                    return (
                      <div key={tableNum} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #eaeaea' }}>
                        <div style={{ display: 'inline-block', background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                          <QRCodeSVG value={qrUrl} size={100} />
                        </div>
                        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px' }}>Table {tableNum}</p>
                        <a href={qrUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', background: '#e6ded8', padding: '5px 10px', borderRadius: '5px', color: '#2c1e16', textDecoration: 'none', display: 'inline-block' }}>Visit</a>
                      </div>
                    );
                  })}
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
const cardStyle = { background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const buttonStyle = { padding: '10px 20px', background: '#cc5a27', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const linkButtonStyle = { textDecoration: 'none', padding: '8px 15px', background: '#f5f0eb', color: '#2c1e16', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e6ded8', fontSize: '14px' };

export default DashboardOverview;