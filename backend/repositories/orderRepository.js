const db = require('../models/database');

class OrderRepository {
  // Create order
  createOrder(productId, quantity, status = 'completed') {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO "Order" (productId, quantity, status) VALUES (?, ?, ?)',
        [productId, quantity, status],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, productId, quantity, status });
        }
      );
    });
  }

  // Get order by ID
  getOrderById(orderId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM "Order" WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Get all orders
  getAllOrders() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM "Order"', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Get orders by product ID
  getOrdersByProductId(productId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM "Order" WHERE productId = ?', [productId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = new OrderRepository();
