# Testing Guide - Inventory Allocation System

## Prerequisites

- Backend running on http://localhost:5000
- Database seeded with sample products
- Frontend and/or Mobile app ready (optional for API testing)

## Test Cases

### 1. Successful Order Placement

**Test**: Place a valid order
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5}'
```

**Expected Response** (Status: 201):
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

✅ **Verify**: 
- Order is created
- Stock is deducted
- Response is 201

---

### 2. Product Not Found

**Test**: Order non-existent product
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 999, "quantity": 1}'
```

**Expected Response** (Status: 404):
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 999 does not exist"
  }
}
```

✅ **Verify**:
- Status code is 404
- Error code is PRODUCT_NOT_FOUND
- Stock is NOT deducted

---

### 3. Insufficient Stock

**Test**: Order more than available stock
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 4, "quantity": 100}'
```

**Expected Response** (Status: 409):
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock. Available: 30, Requested: 100"
  }
}
```

✅ **Verify**:
- Status code is 409 (Conflict)
- Error code is INSUFFICIENT_STOCK
- Stock is NOT deducted

---

### 4. Invalid Quantity (Negative)

**Test**: Order negative quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": -5}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUANTITY",
    "message": "Quantity must be greater than 0"
  }
}
```

✅ **Verify**:
- Status code is 400
- Error code is INVALID_QUANTITY

---

### 5. Invalid Quantity (Zero)

**Test**: Order zero quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 0}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUANTITY",
    "message": "Quantity must be greater than 0"
  }
}
```

✅ **Verify**:
- Status code is 400
- Error code is INVALID_QUANTITY

---

### 6. Invalid Product ID (Negative)

**Test**: Order with negative product ID
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": -1, "quantity": 5}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PRODUCT_ID",
    "message": "Invalid product ID"
  }
}
```

✅ **Verify**:
- Status code is 400
- Error code is INVALID_PRODUCT_ID

---

### 7. Missing Product ID

**Test**: Order without product ID
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Product ID and quantity are required"
  }
}
```

✅ **Verify**:
- Status code is 400
- Error code is INVALID_INPUT

---

### 8. Missing Quantity

**Test**: Order without quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Product ID and quantity are required"
  }
}
```

✅ **Verify**:
- Status code is 400
- Error code is INVALID_INPUT

---

### 9. Empty JSON

**Test**: Send empty JSON
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Product ID and quantity are required"
  }
}
```

✅ **Verify**:
- Status code is 400
- Error code is INVALID_INPUT

---

### 10. Non-Integer Quantity

**Test**: Order with non-integer quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5.5}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUANTITY",
    "message": "Quantity must be an integer"
  }
}
```

✅ **Verify**:
- Status code is 400
- Error code is INVALID_QUANTITY

---

## Concurrency Testing

### Test Concurrent Requests (10 Simultaneous)

**Scenario**: Multiple clients order same product simultaneously

```bash
# Setup: Reset product 2 (Mouse) stock to 50 first
# Then run:

for i in {1..10}; do 
  curl -X POST http://localhost:5000/api/order \
    -H "Content-Type: application/json" \
    -d '{"productId": 2, "quantity": 5}' & 
done; wait
```

**Expected Behavior**:
- All 10 requests succeed
- Final stock = 50 - (10 × 5) = 0
- No race conditions
- No stock goes negative
- Each order has unique ID

**Verify with**:
```bash
# Check final stock
sqlite3 data/inventory.db "SELECT stock FROM Product WHERE id = 2;"
# Should show 0

# Count successful orders
sqlite3 data/inventory.db "SELECT COUNT(*) FROM \"Order\" WHERE productId = 2;"
# Should show 10
```

---

### Test Concurrent Requests with Partial Success

**Scenario**: Multiple clients, but insufficient stock for all

```bash
# Setup: Reset product 4 (Monitor) stock to 20
# Then run 5 concurrent requests for 5 units each (total 25 needed, only 20 available)

for i in {1..5}; do 
  curl -X POST http://localhost:5000/api/order \
    -H "Content-Type: application/json" \
    -d '{"productId": 4, "quantity": 5}' & 
done; wait
```

**Expected Behavior**:
- First 4 orders succeed (total 20 units)
- 5th order fails with INSUFFICIENT_STOCK
- Stock never goes negative
- Final stock = 0

---

## Stock Deduction Verification

### Test Single Order Stock Deduction

```bash
# Before order - check stock
sqlite3 data/inventory.db "SELECT id, name, stock FROM Product WHERE id = 1;"

# Place order
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 3}'

# After order - verify stock reduced
sqlite3 data/inventory.db "SELECT id, name, stock FROM Product WHERE id = 1;"
```

✅ **Expected**: Stock reduced by exactly 3

---

## Prevention of Negative Stock

### Test Boundary Condition

```bash
# Get current stock
sqlite3 data/inventory.db "SELECT stock FROM Product WHERE id = 3;" 
# Let's say it shows 150

# Try to order more than available (151)
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 3, "quantity": 151}'

# Verify stock hasn't changed
sqlite3 data/inventory.db "SELECT stock FROM Product WHERE id = 3;"
```

✅ **Expected**: 
- Request fails with INSUFFICIENT_STOCK
- Stock remains 150 (unchanged)

---

## Multiple Endpoints Verification

**Test**: Verify only POST /order exists (no other endpoints)

```bash
# This should fail
curl http://localhost:5000/api/products
# Should return 404 or similar error

# This should fail
curl http://localhost:5000/api/orders
# Should return 404 or similar error

# This should fail (wrong method)
curl -X GET http://localhost:5000/api/order
# Should return 404 or Method Not Allowed

# This should fail (wrong method)
curl -X DELETE http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}'
# Should return 404 or Method Not Allowed
```

✅ **Expected**: Only POST /api/order works

---

## Architecture Verification

### Verify Code Structure

Check that backend follows required structure:

```bash
# Check directory structure
tree backend/ -L 2

# Should have:
# - backend/routes/
# - backend/controllers/
# - backend/services/
# - backend/repositories/
# - backend/models/
```

✅ **Expected Output**:
```
backend/
├── controllers/
│   └── orderController.js
├── repositories/
│   ├── orderRepository.js
│   └── productRepository.js
├── routes/
│   └── orderRoutes.js
├── services/
│   └── orderService.js
├── models/
│   └── database.js
├── server.js
└── package.json
```

---

## Platform Testing

### Test React Frontend

1. Navigate to http://localhost:3000
2. Try placing various orders
3. Verify:
   - Form validation works
   - Success/error messages appear
   - Order history updates
   - Product info is visible

### Test Flutter Mobile App

1. Run `flutter run` in mobile directory
2. Try placing various orders
3. Verify:
   - Input validation works
   - Success/error messages appear
   - Order history updates
   - Same API works

---

## Summary Checklist

✅ Single API endpoint exists (POST /order)
✅ Product validation works
✅ Stock validation works
✅ Stock deduction works
✅ Concurrent requests are safe
✅ Negative stock prevention works
✅ Edge cases handled
✅ Proper error codes returned
✅ Correct HTTP status codes
✅ Backend architecture followed
✅ React frontend works
✅ Flutter app works
✅ No other endpoints exist
✅ Logic not in frontend
✅ All database operations in repositories

---

**Testing Complete** ✅
