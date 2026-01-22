# Inventory Allocation System

A complete inventory management system with a single unified API endpoint built with Node.js, React, and Flutter.

## 🎯 Project Structure

```
task2/
├── backend/          # Node.js + Express backend
│   ├── controllers/  # Request handlers
│   ├── services/     # Business logic
│   ├── repositories/ # Data access layer
│   ├── routes/       # API endpoints
│   ├── models/       # Database setup
│   ├── server.js     # Main server
│   ├── seed.js       # Database seeding
│   └── package.json
├── frontend/         # React.js frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   └── App.js
│   └── package.json
└── mobile/           # Flutter mobile app
    ├── lib/
    │   ├── screens/     # Flutter screens
    │   ├── services/    # API client
    │   └── main.dart
    └── pubspec.yaml
```

## ✨ Key Features

### ✅ Single API Endpoint
- **POST /api/order** - Only one endpoint as per requirements
- Handles validation, stock management, and concurrency

### 🔐 Strict Architecture
- **Controllers**: Request handling and response formatting
- **Services**: Business logic and validation
- **Repositories**: Database operations
- **Models**: Database schema and connection

### 🛡️ Safety Features
- ✓ Concurrent request handling with locks
- ✓ Prevents negative stock
- ✓ Validates product existence
- ✓ Validates available stock
- ✓ Input validation and sanitization
- ✓ Error handling for all edge cases

### 🎨 Multi-Platform UI
- React web interface with order history
- Flutter mobile app with real-time updates

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm start

# In another terminal, seed the database
node seed.js
```

Backend runs on `http://localhost:5000`

Sample products created:
- ID 1: Laptop (50 units)
- ID 2: Mouse (200 units)
- ID 3: Keyboard (150 units)
- ID 4: Monitor (30 units)
- ID 5: USB Cable (500 units)

### 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

### 3. Mobile Setup (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

## 📡 API Documentation

### POST /api/order

**Request:**
```json
{
  "productId": 1,
  "quantity": 5
}
```

**Success Response (201):**
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

**Error Responses:**

**400 - Invalid Input:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Product ID and quantity are required"
  }
}
```

**404 - Product Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 999 does not exist"
  }
}
```

**409 - Insufficient Stock:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock. Available: 10, Requested: 20"
  }
}
```

## 🧪 Testing

### Test Concurrent Requests

Using curl (multiple simultaneous requests):

```bash
# Terminal 1
for i in {1..10}; do curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1}' & done; wait

# Check results
curl http://localhost:5000/api/order
```

### Test Edge Cases

1. **Invalid Product ID:**
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 999, "quantity": 1}'
```

2. **Insufficient Stock:**
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1000}'
```

3. **Invalid Quantity:**
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": -5}'
```

4. **Missing Parameters:**
```bash
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 🔄 Request Flow

```
Frontend/Mobile
    ↓
POST /api/order
    ↓
OrderController (Validation & Response)
    ↓
OrderService (Business Logic)
    ├─ Acquire Lock
    ├─ Validate Product
    ├─ Check Stock
    ├─ Deduct Stock
    ├─ Create Order
    └─ Release Lock
    ↓
Repositories (Database Operations)
    ├─ ProductRepository
    └─ OrderRepository
    ↓
Response to Client
```

## 📋 Validation Rules

### Input Validation
- productId must be a positive integer
- quantity must be a positive integer
- Both fields are required

### Business Logic
- Product must exist
- Stock must be sufficient
- Stock cannot go negative
- Concurrent requests are handled safely

## 🗄️ Database

SQLite database with two tables:

### Product Table
```sql
CREATE TABLE Product (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Order Table
```sql
CREATE TABLE "Order" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Product(id)
);
```

## 🔒 Architecture Compliance

✅ **Single API Endpoint**: Only POST /order
✅ **Proper Separation**: routes → controllers → services → repositories
✅ **No Mixed Logic**: Clear responsibilities
✅ **Stock Safety**: Prevents negative stock
✅ **Concurrency**: Lock mechanism for thread safety
✅ **Edge Cases**: All scenarios handled

## 🚫 What's NOT Implemented (By Design)

- ❌ Multiple endpoints (only one API)
- ❌ Logic in frontend (all in backend)
- ❌ Direct database queries in controllers
- ❌ Unhandled error scenarios

## 📦 Dependencies

### Backend
- express: Web framework
- sqlite3: Database
- cors: Cross-origin requests
- http: For client requests

### Frontend
- react: UI framework
- react-scripts: Build tools

### Mobile
- http: HTTP requests
- provider: State management

## 📝 Notes

- Database is created automatically on first run
- Use `seed.js` to populate sample data
- Mobile app requires IP address instead of localhost for physical devices
- All operations are atomic and thread-safe

## 🎓 Learning Points

1. **API Design**: Single endpoint with clear responsibilities
2. **Architecture**: Proper separation of concerns
3. **Concurrency**: Lock mechanism for safe stock management
4. **Error Handling**: Comprehensive error scenarios
5. **Multi-Platform**: Same backend serves web and mobile

---

**Status**: ✅ Complete and Ready for Testing
**Timeline**: ✅ Within 3-day requirement
