import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const CustomerMenu = () => {
  const { restaurantSlug, tableNumber } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Order state tracking
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
          totalAmount: totalAmount
        })
      });
      const data = await response.json();
      if (data.success) {
        setPlacedOrder(data.data);
        setCart([]);
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
      const response = await fetch(`${API_URL}/orders/${placedOrder.id}/pay`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (data.success) {
        setPaymentSuccess(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={containerStyle}>Loading Digital Menu...</div>;
  if (!restaurant) return <div style={containerStyle}>Restaurant not found</div>;

  // Render Post-Order Screen
  if (placedOrder) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ color: '#2c1e16', marginBottom: '10px' }}>Your Order is in the Kitchen! 👨‍🍳</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Table {tableNumber}</p>
          
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', textAlign: 'left', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Order Summary:</h4>
            {placedOrder.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total:</span>
              <span>${placedOrder.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {!paymentSuccess ? (
            <div>
              <p style={{ fontSize: '14px', color: '#666' }}>Finished eating? Ready to go?</p>
              <button onClick={handlePayment} style={{...buttonStyle, width: '100%', padding: '15px', fontSize: '18px', background: '#70e000', color: 'black'}}>
                Pay Bill Online
              </button>
            </div>
          ) : (
            <div style={{ padding: '20px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '10px', fontWeight: 'bold' }}>
              ✅ Payment Successful! Thank you for dining with {restaurant.name}.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Menu
  return (
    <div style={containerStyle}>
      <h1 style={{ color: '#cc5a27', marginBottom: '5px' }}>{restaurant.name}</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Table: <strong>{tableNumber}</strong></p>

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
            <h3 style={{ margin: 0 }}>Your Order</h3>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffb703' }}>${totalAmount.toFixed(2)}</span>
          </div>
          
          <ul style={{ padding: 0, margin: '0 0 20px 0', listStyle: 'none' }}>
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
            Place Order
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
