import React, { useState, useEffect } from 'react';
import './App.css';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';

function App() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleOrderSuccess = (newOrder) => {
    setOrders([newOrder, ...orders]);
    setMessage('Order placed successfully!');
    setMessageType('success');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleOrderError = (error) => {
    setMessage(error);
    setMessageType('error');
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📦 Inventory Allocation System</h1>
        <p>Place orders and manage your inventory</p>
      </header>

      <main className="main-content">
        <div className="container">
          {message && (
            <div className={`alert alert-${messageType}`}>
              {message}
            </div>
          )}

          <div className="content-grid">
            <section className="form-section">
              <OrderForm
                onSuccess={handleOrderSuccess}
                onError={handleOrderError}
              />
            </section>

            <section className="history-section">
              <OrderHistory orders={orders} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
