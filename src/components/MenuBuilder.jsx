import React, { useState } from 'react';

const MenuBuilder = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    // For now, we just add it to the local list. 
    // Next, we will connect this to your Neon Database!
    setMenuItems([...menuItems, { ...formData, id: Date.now() }]);
    setFormData({ name: '', price: '', description: '' });
  };

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
          type="number" placeholder="Price ($)" 
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
        {menuItems.map(item => (
          <div key={item.id} style={cardStyle}>
            <div>
              <strong>{item.name}</strong> - ${item.price}
              <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#777' }}>{item.description}</p>
            </div>
            <button style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
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