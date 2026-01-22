const db = require('../models/database');

class ProductRepository {
  // Get product by ID
  getProductById(productId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM Product WHERE id = ?', [productId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Get product by name
  getProductByName(name) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM Product WHERE name = ?', [name], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Update stock (with atomic operation)
  updateStock(productId, newStock) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE Product SET stock = ? WHERE id = ?',
        [newStock, productId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  // Create product
  createProduct(name, stock) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Product (name, stock) VALUES (?, ?)',
        [name, stock],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, name, stock });
        }
      );
    });
  }

  // Get all products
  getAllProducts() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM Product', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = new ProductRepository();
