import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MenuBuilder = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.PROD ? "https://restaurant-saas-j7ed.onrender.com" : "http://localhost:5000";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) {
          setMenuItems(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) fetchMenu();
  }, [restaurantId, API_URL]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description
        })
      });
      const data = await response.json();
      if (data.success) {
        setMenuItems([...menuItems, data.data]);
        setFormData({ name: '', price: '', description: '' });
      } else {
        alert("Error adding item: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      const response = await fetch(`${API_URL}/menu/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setMenuItems(menuItems.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading menu...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ color: '#2c1e16' }}>🍔 Menu Builder</h2>
      <p style={{ color: '#666' }}>Add dishes to your digital menu.</p>

      {/* --- ADD ITEM FORM --- */}
      <form onSubmit={handleAdd} style={formStyle}>
        <input 
          type="text" placeholder="Dish Name (e.g. Wagyu Burger)" 
          value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
          style={inputStyle} required 
        />
        <input 
          type="number" step="0.01" placeholder="Price ($)" 
          value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
          style={inputStyle} required 
        />
        <textarea 
          placeholder="Description" 
          value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
          style={{ ...inputStyle, height: '80px' }}
        />
        <button type="submit" style={buttonStyle}>Add to Menu</button>
      </form>

      {/* --- MENU PREVIEW --- */}
      <div style={{ marginTop: '40px' }}>
        <h3>Your Live Menu</h3>
        {menuItems.length === 0 && <p>No items yet. Add one above!</p>}
        {menuItems.map(item => (
          <div key={item.id} style={cardStyle}>
            <div>
              <strong>{item.name}</strong> - ${item.price}
              <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#777' }}>{item.description}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: '10px' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const buttonStyle = { padding: '12px', background: '#cc5a27', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const cardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'white', marginBottom: '10px', borderRadius: '10px', borderLeft: '5px solid #cc5a27' };

export default MenuBuilder;