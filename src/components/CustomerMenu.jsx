import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CustomerMenu = () => {
  const { restaurantSlug, tableNumber } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Session tracking
  const [activeOrders, setActiveOrders] = useState([]);
  const [view, setView] = useState('MENU'); // MENU | ACTIVE_ORDERS | PAYMENT_SUCCESS

  const API_URL = import.meta.env.PROD ? "https://restaurant-saas-j7ed.onrender.com" : "http://localhost:5000";

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_URL}/public/menu/${restaurantSlug}`);
        const data = await response.json();
        if (data.success) {
          setRestaurant(data.data);
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };
    if (restaurantSlug) fetchMenu();
  }, [restaurantSlug, API_URL]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate grand total across all unpaid active orders
  const grandTotal = activeOrders
    .filter(o => o.paymentStatus !== 'PAID')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableNumber: tableNumber,
          items: cart,
          totalAmount: cartTotal
        })
      });
      const data = await response.json();
      if (data.success) {
        setActiveOrders([...activeOrders, data.data]);
        setCart([]);
        setView('ACTIVE_ORDERS');
      } else {
        alert("Could not place order");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order");
    }
  };

  const handlePayment = async () => {
    try {
      const unpaidOrders = activeOrders.filter(o => o.paymentStatus !== 'PAID');
      
      // Request pay for all unpaid orders
      await Promise.all(
        unpaidOrders.map(order => 
          fetch(`${API_URL}/orders/${order.id}/pay`, { method: 'PUT' })
        )
      );
      
      setView('PAYMENT_SUCCESS');
    } catch (err) {
      console.error(err);
      alert("Payment processing error");
    }
  };

  if (loading) return <div style={containerStyle}>Loading Digital Menu...</div>;
  if (!restaurant) return <div style={containerStyle}>Restaurant not found</div>;

  if (view === 'PAYMENT_SUCCESS') {
    return (
      <div style={containerStyle}>
         <div style={{ padding: '30px', background: 'white', color: '#2e7d32', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>✅ Payment Successful!</h2>
            <p style={{ margin: 0 }}>Thank you for dining with {restaurant.name}.</p>
         </div>
      </div>
    );
  }

  if (view === 'ACTIVE_ORDERS') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ color: '#2c1e16', marginBottom: '5px' }}>Your Table Session</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Table {tableNumber}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
            {activeOrders.map((order, idx) => (
              <div key={order.id} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', textAlign: 'left', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold' }}>Round {idx + 1}</span>
                  <span style={{ 
                    padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                    background: order.status === 'COMPLETED' ? '#e8f5e9' : '#fff3e0',
                    color: order.status === 'COMPLETED' ? '#2e7d32' : '#e65100'
                  }}>
                    {order.status}
                  </span>
                </div>
                
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '14px' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ background: '#1f150f', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Total Bill:</span>
              <span style={{ color: '#ffb703' }}>${grandTotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setView('MENU')} style={{ flex: 1, padding: '12px', background: '#e6ded8', color: '#1f150f', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                + Order More
              </button>
              <button onClick={handlePayment} style={{ flex: 1, padding: '12px', background: '#70e000', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                💳 Pay Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Menu
  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ color: '#cc5a27', margin: '0 0 5px 0' }}>{restaurant.name}</h1>
          <p style={{ color: '#666', margin: 0 }}>Table: <strong>{tableNumber}</strong></p>
        </div>
        {activeOrders.length > 0 && (
          <button onClick={() => setView('ACTIVE_ORDERS')} style={{ background: '#1f150f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            View Active Orders ({activeOrders.length})
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {restaurant.menuItems.length === 0 ? (
          <p>This restaurant has no menu items yet.</p>
        ) : (
          restaurant.menuItems.map(item => (
            <div key={item.id} style={{...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#2c1e16' }}>{item.name}</h3>
                <p style={{ margin: '0', color: '#888', fontSize: '14px' }}>{item.description}</p>
                <div style={{ marginTop: '8px', fontWeight: 'bold', color: '#cc5a27' }}>${item.price.toFixed(2)}</div>
              </div>
              <button 
                onClick={() => addToCart(item)}
                style={{ background: '#f5f0eb', border: 'none', padding: '10px 15px', borderRadius: '8px', color: '#cc5a27', fontWeight: 'bold', cursor: 'pointer' }}>
                + Add
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div style={{ position: 'sticky', bottom: '20px', background: '#2c1e16', padding: '20px', borderRadius: '15px', color: 'white', marginTop: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Your Cart</h3>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffb703' }}>${cartTotal.toFixed(2)}</span>
          </div>
          
          <ul style={{ padding: 0, margin: '0 0 20px 0', listStyle: 'none', maxHeight: '150px', overflowY: 'auto' }}>
            {cart.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span>{item.quantity}x {item.name}</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>✖</button>
                </div>
              </li>
            ))}
          </ul>
          
          <button onClick={handleCheckout} style={{ ...buttonStyle, width: '100%', background: '#ffb703', color: 'black' }}>
            Place Order to Kitchen
          </button>
        </div>
      )}
    </div>
  );
};

const containerStyle = { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' };
const cardStyle = { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' };
const buttonStyle = { padding: '12px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };

export default CustomerMenu;
