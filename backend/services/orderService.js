const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');

// Lock mechanism to handle concurrent requests safely
const locks = new Map();

class OrderService {
  // Acquire lock for product to prevent race conditions
  async acquireLock(productId) {
    while (locks.has(productId)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    locks.set(productId, true);
  }

  // Release lock
  releaseLock(productId) {
    locks.delete(productId);
  }

  // Place order with full validation and stock deduction
  async placeOrder(productId, quantity) {
    // Input validation
    if (!productId || !quantity) {
      throw {
        code: 'INVALID_INPUT',
        message: 'Product ID and quantity are required'
      };
    }

    if (quantity <= 0) {
      throw {
        code: 'INVALID_QUANTITY',
        message: 'Quantity must be greater than 0'
      };
    }

    if (!Number.isInteger(quantity)) {
      throw {
        code: 'INVALID_QUANTITY',
        message: 'Quantity must be an integer'
      };
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      throw {
        code: 'INVALID_PRODUCT_ID',
        message: 'Invalid product ID'
      };
    }

    // Acquire lock for this product
    await this.acquireLock(productId);

    try {
      // Validate product exists
      const product = await productRepository.getProductById(productId);
      if (!product) {
        throw {
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${productId} does not exist`
        };
      }

      // Validate available stock
      if (product.stock < quantity) {
        throw {
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
        };
      }

      // Prevent negative stock - deduct stock
      const newStock = product.stock - quantity;
      await productRepository.updateStock(productId, newStock);

      // Create order
      const order = await orderRepository.createOrder(productId, quantity, 'completed');

      return {
        success: true,
        order: {
          id: order.id,
          productId: order.productId,
          quantity: order.quantity,
          status: order.status,
          message: 'Order placed successfully'
        },
        product: {
          id: product.id,
          name: product.name,
          previousStock: product.stock,
          newStock: newStock
        }
      };
    } finally {
      // Always release lock
      this.releaseLock(productId);
    }
  }

  // Get order details
  async getOrder(orderId) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw {
        code: 'ORDER_NOT_FOUND',
        message: `Order with ID ${orderId} does not exist`
      };
    }
    return order;
  }
}

module.exports = new OrderService();
