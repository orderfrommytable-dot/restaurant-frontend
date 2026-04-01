import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';

const Dashboard = ({ token, handleLogout, customerSlug, isCustomer }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [publicMenu, setPublicMenu] = useState(null);
  const [managingRestaurant, setManagingRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState('');

  // UPDATE THIS: Replace with your actual Vercel URL
  const APP_URL = "https://restaurant-frontend-two-gold.vercel.app"; 

  const queryParams = new URLSearchParams(window.location.search);
  const tableNumber = queryParams.get('table');

  // --- DATA FETCHING ---
  useEffect(() => {
    if (isCustomer && customerSlug) {
      fetch(`https://restaurant-saas-j7ed.onrender.com/public/menu/${customerSlug}`)
        .then(res => res.json())
        .then(data => { if (data.success) setPublicMenu(data.data) });
    } else if (token) {
      fetch('https://restaurant-saas-j7ed.onrender.com/restaurants', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => { if (data.success) setRestaurants(data.data) });
    }
  }, [token, customerSlug, isCustomer]);

  // --- SOCKET & ORDERS ---
  const fetchOrders = async () => {
    if (managingRestaurant && token) {
      const res = await fetch(`https://restaurant-saas-j7ed.onrender.com/restaurants/${managingRestaurant.id}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    }
  };

  useEffect(() => {
    if (managingRestaurant) {
      fetchOrders();
      const socket = io("https://restaurant-saas-j7ed.onrender.com", { transports: ['websocket'] });
      socket.on("newOrder", (data) => {
        if (data.restaurantId === managingRestaurant.id) fetchOrders();
      });
      return () => socket.disconnect();
    }
  }, [managingRestaurant]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch('https://restaurant-saas-j7ed.onrender.com/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newRestaurantName })
    });
    const data = await res.json();
    if (data.success) { 
      setRestaurants([...restaurants, data.data]); 
      setNewRestaurantName(''); 
    }
  };

  // --- RENDER: CUSTOMER VIEW ---
  if (isCustomer) {
     return (
       <div className="customer-view" style={{ background: '#121212', color: 'white', minHeight: '100vh', textAlign: 'center' }}>
         <header style={{ padding: '40px', background: '#1ed760', color: 'black' }}>
            <h1 style={{ margin: 0 }}>{publicMenu?.name || 'Loading Menu...'}</h1>
            {tableNumber && <p style={{ fontWeight: 'bold' }}>Table No: {tableNumber}</p>}
         </header>
         <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            {publicMenu?.menuItems?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #282828' }}>
                <span>{item.name}</span>
                <span style={{ color: '#1ed760' }}>${item.price.toFixed(2)}</span>
              </div>
            ))}
         </div>
       </div>
     );
  }

  // --- RENDER: KITCHEN VIEW ---
  if (managingRestaurant) {
    return (
      <div className="kitchen-view" style={{ background: '#121212', color: 'white', minHeight: '100vh', padding: '20px' }}>
        <button onClick={() => setManagingRestaurant(null)} style={{ background: '#282828', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', marginBottom: '20px' }}>
          ← Back to Dashboard
        </button>
        <h2>🛎️ Live Orders: {managingRestaurant.name}</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {orders.filter(o => o.status !== 'COMPLETED').map(order => (
            <div key={order.id} style={{ background: '#181818', padding: '20px', borderRadius: '10px', width: '250px', borderTop: '4px solid #1ed760' }}>
              <h4>Table {order.tableNumber}</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {order.items.map((item, i) => <li key={i}>{item.name}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER: ADMIN MAIN ---
  return (
    <div className="admin-main" style={{ background: '#121212', color: 'white', minHeight: '100vh', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Your Restaurants</h1>
        <button onClick={handleLogout} style={{ background: 'transparent', color: 'white', border: '1px solid #727272', padding: '10px 25px', borderRadius: '50px', cursor: 'pointer' }}>
          Log Out
        </button>
      </header>

      <section style={{ marginBottom: '50px', background: '#181818', padding: '30px', borderRadius: '15px' }}>
        <h3 style={{ marginTop: 0 }}>Add New Restaurant</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '15px' }}>
          <input 
            style={{ flex: 1, padding: '15px', borderRadius: '5px', background: '#282828', border: '1px solid #333', color: 'white' }} 
            placeholder="Restaurant Name" 
            value={newRestaurantName} 
            onChange={e => setNewRestaurantName(e.target.value)} 
            required 
          />
          <button type="submit" style={{ padding: '15px 30px', background: '#1ed760', color: 'black', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>
            Create
          </button>
        </form>
      </section>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {restaurants.map(r => {
          // Pointing to VERCEL for the QR code!
          const qrUrl = `${APP_URL}/?menu=${r.slug}&table=5`;
          
          return (
            <div key={r.id} style={{ background: '#181818', padding: '25px', borderRadius: '15px', width: '300px', textAlign: 'center', transition: '0.3s' }}>
              <h3 style={{ marginBottom: '20px' }}>{r.name}</h3>
              <button 
                onClick={() => setManagingRestaurant(r)} 
                style={{ width: '100%', padding: '12px', background: '#1ed760', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}>
                Open Kitchen View
              </button>
              <div style={{ background: 'white', padding: '10px', borderRadius: '10px', display: 'inline-block', marginBottom: '15px' }}>
                <QRCodeSVG value={qrUrl} size={150} />
              </div>
              <p><a href={qrUrl} target="_blank" rel="noreferrer" style={{ color: '#1ed760', textDecoration: 'none', fontSize: '0.9rem' }}>Preview Customer Menu →</a></p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;