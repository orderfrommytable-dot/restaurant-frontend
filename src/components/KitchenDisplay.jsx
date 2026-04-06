import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const KitchenDisplay = () => {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const API_URL = import.meta.env.PROD ? "https://restaurant-saas-j7ed.onrender.com" : "http://localhost:5000";

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filter out completed for the main kitchen view
        const activeOrders = data.data.filter(o => o.status !== 'COMPLETED');
        setOrders(activeOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    if (!restaurantId) return;
    
    // Initial fetch
    fetchOrders();

    // Setup Socket
    const socket = io(API_URL);
    
    socket.on("connect", () => {
      console.log("🟢 Connected to live kitchen socket");
    });
    
    socket.on("newOrder", (data) => {
      if (data.restaurantId === parseInt(restaurantId)) {
        console.log("📢 New order received!");
        
        try {
          // Play a simple notification beep
          const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
          audio.play().catch(e => console.log("Browser blocked autoplay sound", e));
        } catch (err) {}
        
        fetchOrders();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, API_URL]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders(); // Refresh after update
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#111', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#ffb703' }}>👨‍🍳 Live Kitchen - Restaurant #{restaurantId}</h2>
      
      {orders.length === 0 ? (
        <p style={{ color: '#aaa', marginTop: '20px' }}>Waiting for new orders...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {orders.map(order => {
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            
            return (
              <div key={order.id} style={{
                background: order.status === 'COOKING' ? '#2e1f0e' : '#222',
                border: `2px solid ${order.status === 'COOKING' ? '#ffb703' : '#444'}`,
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Table {order.tableNumber}</span>
                  <span style={{ 
                    background: order.status === 'PENDING' ? '#c1121f' : '#ffb703', 
                    color: order.status === 'PENDING' ? 'white' : 'black',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {order.status}
                  </span>
                </div>
                
                <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0' }}>
                  {items && items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', fontSize: '16px' }}>
                      <span style={{ fontWeight: 'bold', color: '#ffb703' }}>{item.quantity}x</span> {item.name}
                    </li>
                  ))}
                </ul>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'COOKING')}
                      style={{ flex: 1, padding: '10px', background: '#ffb703', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Start Cooking
                    </button>
                  )}
                  {order.status === 'COOKING' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'COMPLETED')}
                      style={{ flex: 1, padding: '10px', background: '#70e000', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Mark as Done
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
