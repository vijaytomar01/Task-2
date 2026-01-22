import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';

  Future<Map<String, dynamic>> placeOrder(int productId, int quantity) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/order'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'productId': productId,
          'quantity': quantity,
        }),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw Exception('Request timeout');
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return responseData;
      } else {
        throw Exception(
          responseData['error']['message'] ?? 'Failed to place order',
        );
      }
    } catch (e) {
      throw Exception('Error: ${e.toString()}');
    }
  }
}
