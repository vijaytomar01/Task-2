const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /order - Place an order
router.post('/order', (req, res) => orderController.placeOrder(req, res));

module.exports = router;
