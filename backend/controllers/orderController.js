const orderService = require('../services/orderService');

class OrderController {
  async placeOrder(req, res) {
    try {
      const { productId, quantity } = req.body;

      const result = await orderService.placeOrder(productId, quantity);

      return res.status(201).json(result);
    } catch (error) {
      // Handle known errors
      if (error.code) {
        let statusCode = 400;
        if (error.code === 'PRODUCT_NOT_FOUND') {
          statusCode = 404;
        } else if (error.code === 'INSUFFICIENT_STOCK') {
          statusCode = 409;
        }

        return res.status(statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      // Unexpected error
      console.error('Unexpected error in placeOrder:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  }
}

module.exports = new OrderController();
