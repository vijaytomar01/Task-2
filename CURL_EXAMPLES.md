# Curl Examples - API Testing

Quick copy-paste examples for testing the API.

## Setup

```bash
# Make sure backend is running
cd backend
npm start

# In another terminal, seed database
node seed.js
```

---

## Success Cases

### 1. Place Valid Order
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5}'
```

### 2. Order Multiple Products
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 2, "quantity": 10}'
```

### 3. Small Quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 5, "quantity": 1}'
```

---

## Error Cases - Invalid Input

### 4. Missing Product ID
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

Expected: `400 - INVALID_INPUT`

### 5. Missing Quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}'
```

Expected: `400 - INVALID_INPUT`

### 6. Empty JSON
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: `400 - INVALID_INPUT`

---

## Error Cases - Invalid Quantity

### 7. Negative Quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": -5}'
```

Expected: `400 - INVALID_QUANTITY`

### 8. Zero Quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 0}'
```

Expected: `400 - INVALID_QUANTITY`

### 9. Float Quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5.5}'
```

Expected: `400 - INVALID_QUANTITY`

### 10. String Quantity
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": "abc"}'
```

Expected: `400 - INVALID_QUANTITY`

---

## Error Cases - Invalid Product ID

### 11. Negative Product ID
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": -1, "quantity": 5}'
```

Expected: `400 - INVALID_PRODUCT_ID`

### 12. Zero Product ID
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 0, "quantity": 5}'
```

Expected: `400 - INVALID_PRODUCT_ID`

### 13. Float Product ID
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1.5, "quantity": 5}'
```

Expected: `400 - INVALID_PRODUCT_ID`

---

## Error Cases - Product Not Found

### 14. Non-existent Product
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 999, "quantity": 1}'
```

Expected: `404 - PRODUCT_NOT_FOUND`

### 15. Very High Product ID
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 999999, "quantity": 1}'
```

Expected: `404 - PRODUCT_NOT_FOUND`

---

## Error Cases - Insufficient Stock

### 16. More Than Available
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1000}'
```

Expected: `409 - INSUFFICIENT_STOCK`

### 17. Exact Stock (Success)
```bash
# First, check current stock
curl http://localhost:5000/api/order

# Then order exact amount
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 50}'
```

Expected: `201 - Success`

---

## Concurrency Tests

### 18. Sequential Orders (Manual)
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 2, "quantity": 5}'

curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 2, "quantity": 5}'

curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 2, "quantity": 5}'
```

### 19. Concurrent Requests (Bash)
```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/order \
    -H "Content-Type: application/json" \
    -d '{"productId": 3, "quantity": 5}' &
done
wait
```

Expected: All succeed, stock = 150 - (10*5) = 100

### 20. Concurrent with Depletion (Bash)
```bash
# Stock of product 4 is 30
# Each request needs 5
# 6 concurrent requests = 30 total needed

for i in {1..6}; do
  curl -X POST http://localhost:5000/api/order \
    -H "Content-Type: application/json" \
    -d '{"productId": 4, "quantity": 5}' &
done
wait
```

Expected: First 6 succeed, stock = 0, no errors

### 21. Concurrent Exceeding Stock
```bash
# Stock of product 4 is now 0 from previous test
# But let's say we reset it to 20

for i in {1..5}; do
  curl -X POST http://localhost:5000/api/order \
    -H "Content-Type: application/json" \
    -d '{"productId": 4, "quantity": 10}' &
done
wait
```

Expected: First 2 succeed (20 total), 3rd onwards fail with INSUFFICIENT_STOCK

---

## Health Check

### 22. API Health
```bash
curl http://localhost:5000/health
```

Expected Response:
```json
{
  "status": "ok",
  "message": "Inventory Allocation System is running"
}
```

---

## Using Different Request Tools

### HTTPie
```bash
http POST http://localhost:5000/api/order \
  productId:=1 quantity:=5
```

### Postman
```
Method: POST
URL: http://localhost:5000/api/order
Headers: Content-Type: application/json
Body (JSON):
{
  "productId": 1,
  "quantity": 5
}
```

### Node.js fetch
```javascript
fetch('http://localhost:5000/api/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId: 1, quantity: 5 })
})
.then(r => r.json())
.then(d => console.log(d))
```

### Python requests
```python
import requests

response = requests.post(
    'http://localhost:5000/api/order',
    json={'productId': 1, 'quantity': 5}
)
print(response.json())
```

---

## Verification Commands

### Check Database Content
```bash
sqlite3 backend/data/inventory.db "SELECT * FROM Product;"
sqlite3 backend/data/inventory.db "SELECT * FROM \"Order\";"
sqlite3 backend/data/inventory.db "SELECT COUNT(*) as total_orders FROM \"Order\";"
```

### Check Specific Product Stock
```bash
sqlite3 backend/data/inventory.db "SELECT name, stock FROM Product WHERE id = 1;"
```

### List All Orders
```bash
sqlite3 backend/data/inventory.db "SELECT * FROM \"Order\" ORDER BY createdAt DESC LIMIT 5;"
```

---

## Common Issues

### Connection Refused
```bash
# Make sure backend is running
cd backend
npm start

# Should see: Server is running on http://localhost:5000
```

### Port Already in Use
```bash
# On Windows
netstat -ano | findstr :5000

# On Mac/Linux
lsof -i :5000

# Kill the process and restart backend
```

### Database Locked
```bash
# Wait a moment and try again
# SQLite locks briefly during writes

# If stuck, restart backend
cd backend
npm start
```

### Syntax Error in curl
```bash
# Make sure JSON is properly formatted
# Use single quotes for shell, double quotes inside

# ✓ Correct
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5}'

# ✗ Wrong (unescaped quotes)
curl -X POST http://localhost:5000/api/order \
  -d {"productId": 1, "quantity": 5}
```

---

## Quick Test Script

Save as `test.sh`:

```bash
#!/bin/bash

echo "Testing Inventory Allocation API"
echo "=================================="
echo ""

echo "Test 1: Successful Order"
curl -s -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5}' | jq .

echo ""
echo "Test 2: Invalid Input"
curl -s -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}' | jq .

echo ""
echo "Test 3: Insufficient Stock"
curl -s -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1000}' | jq .

echo ""
echo "All tests completed!"
```

Run with: `bash test.sh`

---

**Ready to test!** Copy and paste any example above. 🚀
