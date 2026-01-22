const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
require('./models/database');

// Routes
app.use('/api', orderRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inventory Allocation System is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  POST http://localhost:${PORT}/api/order`);
  console.log(`  GET http://localhost:${PORT}/health`);
});
