# API Contract

## Single Endpoint

### POST /api/order

**URL**: `http://localhost:5000/api/order`

**Method**: POST

**Content-Type**: application/json

---

## Request

### Body Format
```json
{
  "productId": integer (required, > 0),
  "quantity": integer (required, > 0)
}
```

### Examples

#### Valid Request
```json
{
  "productId": 1,
  "quantity": 5
}
```

#### Invalid Requests
```json
// Missing productId
{
  "quantity": 5
}

// Missing quantity
{
  "productId": 1
}

// Negative quantity
{
  "productId": 1,
  "quantity": -5
}

// Zero quantity
{
  "productId": 1,
  "quantity": 0
}

// Non-integer quantity
{
  "productId": 1,
  "quantity": 5.5
}

// Negative productId
{
  "productId": -1,
  "quantity": 5
}

// String instead of number
{
  "productId": "abc",
  "quantity": "xyz"
}
```

---

## Response

### Success Response (HTTP 201 Created)

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

### Error Response: Invalid Input (HTTP 400)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Product ID and quantity are required"
  }
}
```

### Error Response: Invalid Quantity (HTTP 400)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUANTITY",
    "message": "Quantity must be greater than 0"
  }
}
```

Or:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUANTITY",
    "message": "Quantity must be an integer"
  }
}
```

### Error Response: Invalid Product ID (HTTP 400)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PRODUCT_ID",
    "message": "Invalid product ID"
  }
}
```

### Error Response: Product Not Found (HTTP 404)

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 999 does not exist"
  }
}
```

### Error Response: Insufficient Stock (HTTP 409 Conflict)

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock. Available: 10, Requested: 20"
  }
}
```

### Error Response: Unexpected Error (HTTP 500)

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## HTTP Status Codes

| Status | Meaning | Scenario |
|--------|---------|----------|
| 201 | Created | Order successfully created |
| 400 | Bad Request | Invalid input parameters |
| 404 | Not Found | Product doesn't exist |
| 409 | Conflict | Insufficient stock |
| 500 | Internal Error | Unexpected server error |

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_INPUT | 400 | Missing or null fields |
| INVALID_QUANTITY | 400 | Invalid quantity value |
| INVALID_PRODUCT_ID | 400 | Invalid product ID |
| PRODUCT_NOT_FOUND | 404 | Product doesn't exist |
| INSUFFICIENT_STOCK | 409 | Not enough stock available |
| INTERNAL_ERROR | 500 | Server error |

---

## Request Examples (cURL)

### Success
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 5
  }'
```

### Product Not Found
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 999,
    "quantity": 1
  }'
```

### Insufficient Stock
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 1000
  }'
```

### Invalid Input
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1
  }'
```

---

## Behavior Guarantees

1. **Atomicity**: Either order succeeds completely or fails completely
2. **Consistency**: Stock never goes negative
3. **Isolation**: Concurrent requests don't interfere
4. **Durability**: Order is persisted to database

---

## Concurrency Handling

When multiple requests arrive simultaneously:
- Each request acquires a lock on the product
- Validates and processes in serial order
- Prevents race conditions
- Ensures stock accuracy
- All requests get proper response

Example:
```bash
# 10 concurrent requests for 5 units each
# If stock is 50, first 10 succeed, total 50 deducted
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/order \
    -H "Content-Type: application/json" \
    -d '{"productId": 1, "quantity": 5}' &
done; wait

# Result: 10 orders created, stock = 0 (never negative)
```

---

## Rate Limiting

Not implemented (can be added if needed)

## Authentication

Not implemented (can be added if needed)

## Versioning

Currently v1 (implicit in path `/api/order`)

---

## Notes

- **Database**: SQLite (can be switched to PostgreSQL, MySQL, etc.)
- **Timeout**: 10 seconds for API requests
- **Max Payload**: Default JSON parser limit (100KB)

---

**This API Contract is the ONLY specification for the system.**

No other endpoints exist or will be created.
