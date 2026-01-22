import React, { useState } from 'react';
import './OrderForm.css';
import api from '../services/api';

function OrderForm({ onSuccess, onError }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!productId || !quantity) {
      onError('Please fill in all fields');
      return;
    }

    if (isNaN(productId) || productId <= 0) {
      onError('Product ID must be a valid positive number');
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      onError('Quantity must be a valid positive number');
      return;
    }

    setLoading(true);

    try {
      const response = await api.placeOrder(
        parseInt(productId),
        parseInt(quantity)
      );

      if (response.success) {
        onSuccess(response.order);
        setProductId('');
        setQuantity('');
      } else {
        onError(response.error.message);
      }
    } catch (error) {
      onError(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h2>Place Order</h2>

      <div className="form-group">
        <label htmlFor="productId">Product ID</label>
        <input
          id="productId"
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter product ID"
          disabled={loading}
          min="1"
        />
      </div>

      <div className="form-group">
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          disabled={loading}
          min="1"
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Processing...' : 'Place Order'}
      </button>

      <div className="product-info">
        <h3>Sample Products</h3>
        <ul>
          <li>ID 1: Laptop (50 in stock)</li>
          <li>ID 2: Mouse (200 in stock)</li>
          <li>ID 3: Keyboard (150 in stock)</li>
          <li>ID 4: Monitor (30 in stock)</li>
          <li>ID 5: USB Cable (500 in stock)</li>
        </ul>
      </div>
    </form>
  );
}

export default OrderForm;
