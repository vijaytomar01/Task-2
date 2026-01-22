# Inventory Allocation System - Backend

Node.js + Express backend for the Inventory Allocation System.

## Architecture

```
routes/
└── orderRoutes.js         # Routes (single POST /order endpoint)

controllers/
└── orderController.js     # Request handling & response formatting

services/
└── orderService.js        # Business logic & validation

repositories/
├── productRepository.js   # Product database operations
└── orderRepository.js     # Order database operations

models/
└── database.js            # Database connection & initialization
```

## Setup

```bash
npm install
npm start
```

Server runs on `http://localhost:5000`

### Seed Database

```bash
node seed.js
```

This creates sample products with initial stock.

## API Endpoint

### POST /api/order

**Only one API endpoint** - handles all order operations

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 5
}
```

**Response (201 Success):**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "productId": 1,
    "quantity": 5,
    "status": "completed",
    "message": "Order placed successfully"
  },
  "product": {
    "id": 1,
    "name": "Laptop",
    "previousStock": 50,
    "newStock": 45
  }
}
```

## Validation & Safety

✓ **Input Validation**
  - productId must be positive integer
  - quantity must be positive integer
  - Both fields required

✓ **Product Validation**
  - Product must exist
  - Stock must be sufficient

✓ **Stock Safety**
  - Prevents negative stock
  - Atomic operations
  - Lock mechanism for concurrent requests

## Error Handling

| Code | Status | Message |
|------|--------|---------|
| INVALID_INPUT | 400 | Missing or invalid parameters |
| INVALID_QUANTITY | 400 | Quantity invalid |
| INVALID_PRODUCT_ID | 400 | Product ID invalid |
| PRODUCT_NOT_FOUND | 404 | Product doesn't exist |
| INSUFFICIENT_STOCK | 409 | Not enough stock |
| INTERNAL_ERROR | 500 | Unexpected error |

## Concurrency Handling

Uses a simple but effective lock mechanism:

```javascript
// Acquire lock for product
await this.acquireLock(productId);
try {
  // Critical section
  // - Validate product
  // - Check stock
  // - Deduct stock
  // - Create order
} finally {
  // Always release lock
  this.releaseLock(productId);
}
```

This ensures:
- No race conditions
- Stock never goes negative
- Orders are processed safely

## Database Schema

### Product
```sql
id        INTEGER PRIMARY KEY
name      TEXT UNIQUE
stock     INTEGER
createdAt DATETIME
```

### Order
```sql
id        INTEGER PRIMARY KEY
productId INTEGER FOREIGN KEY
quantity  INTEGER
status    TEXT
createdAt DATETIME
```

## Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Place Order
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5}'
```

### Concurrent Requests
```bash
for i in {1..10}; do 
  curl -X POST http://localhost:5000/api/order \
    -H "Content-Type: application/json" \
    -d '{"productId": 1, "quantity": 1}' & 
done; wait
```

## Code Quality

✓ Clear separation of concerns
✓ No logic mixing
✓ Proper error handling
✓ Atomic operations
✓ Thread-safe concurrency

## Development

```bash
# Install dependencies
npm install

# Start server with auto-reload (requires nodemon)
npm run dev

# Or start normally
npm start
```

## Environment

- Node.js v14+
- SQLite3
- Port: 5000 (default)

## Key Files

| File | Purpose |
|------|---------|
| server.js | Main application entry |
| routes/orderRoutes.js | Single API endpoint |
| controllers/orderController.js | Request handling |
| services/orderService.js | Business logic |
| repositories/*.js | Database operations |
| models/database.js | DB connection |
| seed.js | Sample data |
