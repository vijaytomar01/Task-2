# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │   React Web      │        │   Flutter Mobile │            │
│  │   (Port 3000)    │        │   (Any Device)   │            │
│  └────────┬─────────┘        └────────┬─────────┘            │
│           │                           │                       │
│           └───────────────┬───────────┘                       │
│                           │ HTTP POST                         │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │     API LAYER (Single Endpoint)      │
        │   POST /api/order (Port 5000)       │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼───────────────────┐
        │   OrderController                │
        │  - Validates request             │
        │  - Formats response              │
        │  - Handles errors                │
        └──────────────┬────────────────────┘
                       │
        ┌──────────────▼───────────────────┐
        │   OrderService                   │
        │  - Acquires lock                 │
        │  - Validates product             │
        │  - Checks stock                  │
        │  - Deducts stock                 │
        │  - Creates order                 │
        │  - Releases lock                 │
        └──────────────┬────────────────────┘
                       │
        ┌──────────────▼───────────────────┐
        │   Repositories                   │
        │  ┌──────────────────────────┐    │
        │  │ ProductRepository        │    │
        │  │ - getProductById()       │    │
        │  │ - updateStock()          │    │
        │  └──────────────────────────┘    │
        │                                   │
        │  ┌──────────────────────────┐    │
        │  │ OrderRepository          │    │
        │  │ - createOrder()          │    │
        │  └──────────────────────────┘    │
        └──────────────┬────────────────────┘
                       │
        ┌──────────────▼───────────────────┐
        │   SQLite Database                │
        │  ┌──────────────────────────┐    │
        │  │ Product Table            │    │
        │  │ - id, name, stock        │    │
        │  └──────────────────────────┘    │
        │                                   │
        │  ┌──────────────────────────┐    │
        │  │ Order Table              │    │
        │  │ - id, productId, qty     │    │
        │  └──────────────────────────┘    │
        └────────────────────────────────────┘
```

## Request Flow

```
1. Client Submits Order
   │
   ├─ Product ID: 1
   ├─ Quantity: 5
   │
   ▼
2. POST /api/order
   │
   ▼
3. OrderController.placeOrder()
   │
   ├─ Extract & validate input
   ├─ Call orderService.placeOrder()
   │
   ▼
4. OrderService.placeOrder()
   │
   ├─ Acquire lock for product
   │
   ├─ Validate inputs
   │  ├─ Check productId > 0
   │  ├─ Check quantity > 0
   │  └─ Check quantity is integer
   │
   ├─ Validate product exists
   │  └─ ProductRepository.getProductById()
   │
   ├─ Validate stock available
   │  └─ Check product.stock >= quantity
   │
   ├─ Deduct stock
   │  └─ ProductRepository.updateStock()
   │
   ├─ Create order
   │  └─ OrderRepository.createOrder()
   │
   ├─ Release lock
   │
   ▼
5. Return Success Response (201)
   │
   ├─ order details
   ├─ product info
   └─ message
```

## Concurrency Handling

```
Request 1                Request 2                Request 3
   │                         │                         │
   ▼                         ▼                         ▼
Wait for lock           Wait for lock           Wait for lock
   │                         │                         │
   ├─ Acquired ────────────┐ │                         │
   │ (Lock Set)            │ │                         │
   │                       │ │                         │
   ├─ Validate             │ ├─ Waiting...            │
   ├─ Check Stock          │ │                         │
   ├─ Deduct Stock         │ │                         │
   ├─ Create Order         │ │                         │
   │                       │ │                         │
   └─ Release Lock ────────┼─┘                         │
                           │                           │
                           ├─ Acquired ────────────┐   │
                           │ (Lock Set)            │   │
                           │                       │   │
                           ├─ Validate             │   │
                           ├─ Check Stock          │   │
                           ├─ Deduct Stock         │   │
                           ├─ Create Order         │   │
                           │                       │   │
                           └─ Release Lock ────────┼───┘
                                                   │
                                                   ├─ Acquired
                                                   │ (Lock Set)
                                                   │
                                                   ├─ Validate
                                                   ├─ Check Stock
                                                   ├─ Deduct Stock
                                                   ├─ Create Order
                                                   │
                                                   └─ Release Lock

Key: No race conditions, stock never goes negative
```

## Data Flow - Single Order

```
REQUEST (JSON)
{
  "productId": 1,
  "quantity": 5
}
        │
        ▼
INPUT VALIDATION
✓ productId exists
✓ quantity exists
✓ productId > 0
✓ quantity > 0
✓ quantity is integer
        │
        ▼
DATABASE LOOKUP
Product
┌────┬────────┬───────┐
│ id │ name   │ stock │
├────┼────────┼───────┤
│ 1  │ Laptop │ 50    │
└────┴────────┴───────┘
        │
        ▼
STOCK CHECK
Required: 5
Available: 50
Status: ✓ OK
        │
        ▼
STOCK DEDUCTION
Old Stock: 50
Deduct: 5
New Stock: 45
        │
        ▼
CREATE ORDER
New Order:
┌────┬───────────┬──────────┬──────────┐
│ id │ productId │ quantity │ status   │
├────┼───────────┼──────────┼──────────┤
│ 1  │ 1         │ 5        │ completed│
└────┴───────────┴──────────┴──────────┘
        │
        ▼
RESPONSE (JSON 201)
{
  "success": true,
  "order": {
    "id": 1,
    "productId": 1,
    "quantity": 5,
    "status": "completed"
  },
  "product": {
    "id": 1,
    "name": "Laptop",
    "previousStock": 50,
    "newStock": 45
  }
}
```

## Error Handling Flow

```
REQUEST
   │
   ▼
INPUT VALIDATION
   │
   ├─ Missing fields? ──→ Error 400: INVALID_INPUT
   ├─ Invalid quantity? ─→ Error 400: INVALID_QUANTITY
   ├─ Invalid productId? ─→ Error 400: INVALID_PRODUCT_ID
   │
   ▼
PRODUCT CHECK
   │
   └─ Product not found? ──→ Error 404: PRODUCT_NOT_FOUND
   │
   ▼
STOCK CHECK
   │
   └─ Insufficient stock? ──→ Error 409: INSUFFICIENT_STOCK
   │
   ▼
DATABASE ERROR
   │
   └─ Unexpected error? ──→ Error 500: INTERNAL_ERROR
   │
   ▼
SUCCESS ──→ Response 201
```

## Architecture Layers

```
┌──────────────────────────────────────┐
│         REQUEST/RESPONSE             │ HTTP Layer
├──────────────────────────────────────┤
│                                      │
│  OrderController                     │ Controller Layer
│  └─ Request validation               │
│  └─ Response formatting              │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  OrderService                        │ Business Logic Layer
│  └─ Lock acquisition                 │
│  └─ Validation logic                 │
│  └─ Stock deduction logic            │
│  └─ Order creation logic             │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  ProductRepository                   │ Data Access Layer
│  OrderRepository                     │
│  └─ Database queries                 │
│  └─ Data persistence                 │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  Database                            │ Persistence Layer
│  └─ Product Table                    │
│  └─ Order Table                      │
│                                      │
└──────────────────────────────────────┘
```

## Technology Stack

```
Frontend Layer
├─ React 18.2
├─ CSS3 (Responsive)
└─ Fetch API

Frontend Layer (Mobile)
├─ Flutter
├─ Dart
└─ HTTP Package

Backend Layer
├─ Node.js
├─ Express 4.18
├─ SQLite3
└─ CORS

Deployment
├─ Backend: Port 5000
├─ Frontend: Port 3000
└─ Mobile: Native/Cross-platform
```

---

This architecture ensures:
- ✅ Single responsibility per layer
- ✅ Easy to test each layer independently
- ✅ Easy to maintain and extend
- ✅ Clear data flow
- ✅ Thread-safe operations
- ✅ Scalable design
