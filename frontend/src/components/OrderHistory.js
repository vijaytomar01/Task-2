import React from 'react';
import './OrderHistory.css';

function OrderHistory({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="order-history">
        <h2>Order History</h2>
        <div className="empty-state">
          <p>No orders yet. Place an order to see it here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h2>Order History</h2>
      <div className="orders-list">
        {orders.map((order, index) => (
          <div key={index} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.id}</span>
              <span className={`status status-${order.status}`}>
                {order.status}
              </span>
            </div>
            <div className="order-details">
              <div className="detail-row">
                <span className="label">Product ID:</span>
                <span className="value">{order.productId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Quantity:</span>
                <span className="value">{order.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistory;
