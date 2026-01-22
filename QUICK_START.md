# Quick Start Guide

Get the Inventory Allocation System running in minutes!

## 🚀 5-Minute Setup

### Step 1: Start Backend (Terminal 1)

```bash
cd backend
npm install
npm start
```

You'll see:
```
Server is running on http://localhost:5000
```

### Step 2: Seed Database (Terminal 2)

```bash
cd backend
node seed.js
```

You'll see:
```
✓ Created product: Laptop with stock: 50
✓ Created product: Mouse with stock: 200
✓ Created product: Keyboard with stock: 150
✓ Created product: Monitor with stock: 30
✓ Created product: USB Cable with stock: 500
Database seeding complete!
```

### Step 3A: Start React Frontend (Terminal 3) [OPTIONAL]

```bash
cd frontend
npm install
npm start
```

Opens automatically at http://localhost:3000

### Step 3B: Start Flutter Mobile (Terminal 3) [OPTIONAL]

```bash
cd mobile
flutter pub get
flutter run
```

## ✅ Quick Test

Once backend is running:

```bash
# Test 1: Successful order
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 5}'

# Should return 201 with order details

# Test 2: Insufficient stock
curl -X POST http://localhost:5000/api/order \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1000}'

# Should return 409 with error
```

## 📱 Platform Options

### Web (React)
- **URL**: http://localhost:3000
- **Features**: Order form, real-time history
- **Best for**: Desktop/Tablet testing

### Mobile (Flutter)
- **Command**: `flutter run`
- **Features**: Touch-friendly interface, same API
- **Best for**: Mobile device testing

### API Direct
- **URL**: http://localhost:5000/api/order
- **Method**: POST
- **Best for**: Integration testing, Postman, curl

## 🗺️ File Locations

```
task2/
├── backend/
│   ├── server.js          ← Start here
│   ├── seed.js            ← Run after server
│   └── data/inventory.db  ← Database file
├── frontend/
│   ├── src/App.js         ← React app
│   └── package.json
└── mobile/
    ├── lib/main.dart      ← Flutter app
    └── pubspec.yaml
```

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Change port in backend/server.js line 10:
const PORT = process.env.PORT || 3001;

# Then restart backend
```

### Port 3000 already in use
```bash
# React will ask to use 3001 instead - just press 'y'
# Or set PORT=3001 npm start
```

### Database file not created
```bash
# Make sure data directory exists
cd backend
mkdir data
# Then run seed.js again
```

### CORS errors
```bash
# Frontend can't reach backend?
# Make sure backend is running on http://localhost:5000
# Check proxy in frontend/package.json
```

### Flutter connection refused
```bash
# Mobile can't reach backend?
# Change localhost to your PC IP in mobile/lib/services/api_service.dart
# Example: http://192.168.1.5:5000/api
```

## 📊 Check Status

### Backend Health
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","message":"..."}
```

### Database Status
```bash
sqlite3 backend/data/inventory.db
> SELECT COUNT(*) FROM Product;
# Should show: 5

> SELECT COUNT(*) FROM "Order";
# Shows number of orders placed
```

## 🎯 Next Steps

1. ✅ Backend running?
2. ✅ Database seeded?
3. ✅ Ready to test?

**Choose one:**
- Open http://localhost:3000 for React UI
- Run `flutter run` for mobile app
- Use curl/Postman to test API directly

## 📚 Full Documentation

- [README.md](./README.md) - Complete overview
- [TESTING.md](./TESTING.md) - Detailed test cases
- [backend/README.md](./backend/README.md) - Backend docs
- [frontend/README.md](./frontend/README.md) - Frontend docs
- [mobile/README.md](./mobile/README.md) - Mobile docs

---

**Ready to go!** 🎉

Questions? Check the TESTING.md file for detailed examples.
