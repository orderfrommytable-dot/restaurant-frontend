import { useState, useEffect } from 'react'
import './App.css'
import { QRCodeSVG } from 'qrcode.react'; 
import { io } from 'socket.io-client'; 

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const customerSlug = queryParams.get('menu'); 
  const tableNumber = queryParams.get('table'); 

  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [restaurants, setRestaurants] = useState([])
  const [publicMenu, setPublicMenu] = useState(null)
  
  const [managingRestaurant, setManagingRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newRestaurantName, setNewRestaurantName] = useState('')

  useEffect(() => {
    if (customerSlug) {
      fetch(`https://restaurant-saas-j7ed.onrender.com/public/menu/${customerSlug}`)
        .then(res => res.json())
        .then(data => { if (data.success) setPublicMenu(data.data) })
    }
  }, [customerSlug])

  useEffect(() => {
    if (token && !customerSlug) {
      fetch('https://restaurant-saas-j7ed.onrender.com/restaurants', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => { if (data.success) setRestaurants(data.data) })
    }
  }, [token, customerSlug])

  const fetchOrders = async () => {
    if (managingRestaurant && token) {
      const res = await fetch(`https://restaurant-saas-j7ed.onrender.com/restaurants/${managingRestaurant.id}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    }
  };

  // --- UPGRADED REAL-TIME LISTENER ---
  useEffect(() => {
    fetchOrders();
    setShowHistory(false); 

    if (managingRestaurant) {
      console.log("🎧 Attempting to open tunnel for:", managingRestaurant.name);
      
      // We added { transports: ['websocket'] } to bypass browser blocking!
      const socket = io("https://restaurant-saas-j7ed.onrender.com", { transports: ['websocket'] });
      
      socket.on("connect", () => {
        console.log("🟢 FRONTEND SAYS: Tunnel connected successfully! ID:", socket.id);
      });

      socket.on("newOrder", (data) => {
        console.log("🛎️ FRONTEND HEARD A SHOUT:", data);
        if (data.restaurantId === managingRestaurant.id) {
          console.log("🔄 Automatically refreshing the screen...");
          fetchOrders(); 
        }
      });

      return () => {
        console.log("🔴 FRONTEND SAYS: Closing tunnel.");
        socket.disconnect();
      }
    }
  }, [managingRestaurant]);
  // -----------------------------------

  // --- HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await fetch('https://restaurant-saas-j7ed.onrender.com/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (data.success) { setToken(data.token); localStorage.setItem('token', data.token) } 
    else { alert("Login failed: " + data.message) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const res = await fetch('https://restaurant-saas-j7ed.onrender.com/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newRestaurantName })
    })
    const data = await res.json()
    if (data.success) { setRestaurants([...restaurants, data.data]); setNewRestaurantName('') }
  }

  const handlePlaceOrder = async () => {
    const res = await fetch('https://restaurant-saas-j7ed.onrender.com/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: publicMenu.id,
        tableNumber: tableNumber || "Takeaway",
        items: [{ name: "Test Burger", price: 12.99 }] 
      })
    });
    const data = await res.json();
    if (data.success) alert("Order Sent to Kitchen! 🧑‍🍳");
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const res = await fetch(`https://restaurant-saas-j7ed.onrender.com/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) fetchOrders(); 
  };

  // ==========================================
  // VIEW: CUSTOMER MENU
  // ==========================================
  if (customerSlug) {
    if (!publicMenu) return <div><h1>Loading Menu...</h1></div>
    return (
      <div className="customer-view">
        <header style={{ background: '#ff4757', color: 'white', padding: '20px', textAlign: 'center' }}>
          <h1>{publicMenu.name}</h1>
          {tableNumber && <p style={{background: 'rgba(0,0,0,0.2)', display: 'inline-block', padding: '5px 15px', borderRadius: '20px'}}>📍 Table No: {tableNumber}</p>}
        </header>
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <h2>Menu</h2>
          {publicMenu.menuItems.length === 0 ? <p>No items available.</p> : (
            publicMenu.menuItems.map(item => (
              <div key={item.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', justifyContent: 'space-between' }}>
                <div><h3>{item.name}</h3></div>
                <strong>${item.price.toFixed(2)}</strong>
              </div>
            ))
          )}
          <button onClick={handlePlaceOrder} style={{ marginTop: '30px', width: '100%', padding: '15px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer' }}>
            Place Test Order
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW: KITCHEN DISPLAY SYSTEM
  // ==========================================
  if (managingRestaurant) {
    const activeOrders = orders.filter(o => o.status !== 'COMPLETED');
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');
    const displayedOrders = showHistory ? completedOrders : activeOrders;

    return (
      <div style={{ padding: '20px', background: '#f4f4f4', minHeight: '100vh' }}>
        <button onClick={() => setManagingRestaurant(null)} style={{ padding: '10px', background: '#333', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer', marginBottom: '20px' }}>
          ← Back to Dashboard
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>🛎️ Kitchen: {managingRestaurant.name}</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
          <button onClick={() => setShowHistory(false)} style={{ padding: '10px 20px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer', background: !showHistory ? '#ff4757' : '#ddd', color: !showHistory ? 'white' : '#555', border: 'none', borderRadius: '5px' }}>
            🔥 Active Orders ({activeOrders.length})
          </button>
          <button onClick={() => setShowHistory(true)} style={{ padding: '10px 20px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer', background: showHistory ? '#2ed573' : '#ddd', color: showHistory ? 'white' : '#555', border: 'none', borderRadius: '5px' }}>
            ✅ Order History ({completedOrders.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '30px' }}>
          {displayedOrders.length === 0 ? (
             <p style={{ fontSize: '1.2em', color: '#666' }}>
               {showHistory ? "No completed orders yet." : "No active orders. Kitchen is caught up! ✨"}
             </p>
          ) : (
            displayedOrders.map(order => (
              <div key={order.id} style={{ 
                background: 'white', padding: '20px', borderRadius: '10px', width: '300px', 
                borderTop: order.status === 'PENDING' ? '5px solid #ff4757' : (order.status === 'COOKING' ? '5px solid #f1c40f' : '5px solid #2ed573'), 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', opacity: order.status === 'COMPLETED' ? 0.7 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <h2 style={{ margin: 0 }}>Table {order.tableNumber}</h2>
                  <span style={{ 
                    background: order.status === 'PENDING' ? '#ffeaa7' : (order.status === 'COOKING' ? '#74b9ff' : '#55efc4'), 
                    color: '#000', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' 
                  }}>
                    {order.status}
                  </span>
                </div>
                
                <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0' }}>
                  {order.items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '5px', fontSize: '1.1em' }}>{item.name}</li>
                  ))}
                </ul>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                  {order.status === 'PENDING' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'COOKING')} style={{ padding: '10px', background: '#f1c40f', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                      👨‍🍳 Start Cooking
                    </button>
                  )}
                  {order.status === 'COOKING' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'COMPLETED')} style={{ padding: '10px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                      ✅ Mark Completed
                    </button>
                  )}
                  {order.status === 'COMPLETED' && (
                    <button onClick={() => handleUpdateStatus(order.id, 'COOKING')} style={{ padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                      ⏪ Undo
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW: ADMIN DASHBOARD
  // ==========================================
  if (token) {
    return (
      <div className="dashboard" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
           <h1>🧑‍🍳 Owner Dashboard</h1>
           <button onClick={() => { setToken(''); localStorage.removeItem('token') }} style={{ padding: '10px 20px', cursor: 'pointer' }}>Log Out</button>
        </div>

        <div style={{ margin: '0 auto 40px auto', maxWidth: '500px', padding: '25px', background: '#f9f9f9', borderRadius: '12px' }}>
          <h3>Create New Restaurant</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px' }}>
            <input style={{ flex: 1, padding: '10px' }} placeholder="Restaurant Name" value={newRestaurantName} onChange={e => setNewRestaurantName(e.target.value)} required />
            <button type="submit" style={{ padding: '10px 20px', background: '#ff4757', color: 'white', border: 'none' }}>Create</button>
          </form>
        </div>

        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {restaurants.map(r => {
            const qrUrl = `http://localhost:5173/?menu=${r.slug}&table=5`;
            return (
              <div key={r.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '15px', width: '280px', background: 'white', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 15px 0' }}>{r.name}</h3>
                
                <button 
                  onClick={() => setManagingRestaurant(r)} 
                  style={{ width: '100%', padding: '12px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>
                  View Live Orders 🛎️
                </button>

                <div style={{ background: '#f1f2f6', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                  <QRCodeSVG value={qrUrl} size={160} includeMargin={true} />
                </div>

                <a href={qrUrl} target="_blank" rel="noreferrer" style={{ color: '#ff4757', fontWeight: 'bold' }}>Open Menu →</a>
              </div>
            );
          })}
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW: ADMIN LOGIN
  // ==========================================
  return (
    <div className="login-box" style={{ maxWidth: '400px', margin: '100px auto', padding: '40px', background: 'white', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <input style={{ width: '100%', padding: '12px', marginBottom: '15px' }} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={{ width: '100%', padding: '12px', marginBottom: '25px' }} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ width: '100%', padding: '15px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Log In</button>
      </form>
    </div>
  )
}

export default App