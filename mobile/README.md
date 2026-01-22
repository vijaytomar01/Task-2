# Inventory Allocation System - Flutter

Flutter mobile app for the Inventory Allocation System.

## Setup

```bash
flutter pub get
flutter run
```

## Features

- Place orders with product ID and quantity
- Real-time order history
- Error handling and validation
- Consumes the same POST /order API
- Cross-platform (iOS, Android, Web)

## Prerequisites

- Flutter SDK
- Dart SDK
- iOS: Xcode (for iOS development)
- Android: Android Studio/SDK (for Android development)

## Configuration

Update the API base URL in `lib/services/api_service.dart` if needed:

```dart
static const String baseUrl = 'http://localhost:5000/api';
```

For mobile devices, replace `localhost` with your development machine's IP address.
