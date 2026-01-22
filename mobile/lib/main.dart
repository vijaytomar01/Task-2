import 'package:flutter/material.dart';
import 'services/api_service.dart';

void main() {
  runApp(const InventoryAllocationApp());
}

class InventoryAllocationApp extends StatelessWidget {
  const InventoryAllocationApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Inventory Allocation',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const OrderScreen(),
    );
  }
}

class OrderScreen extends StatefulWidget {
  const OrderScreen({Key? key}) : super(key: key);

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  final TextEditingController productIdController = TextEditingController();
  final TextEditingController quantityController = TextEditingController();
  final ApiService apiService = ApiService();
  bool isLoading = false;
  String? message;
  bool isSuccess = false;
  List<Map<String, dynamic>> orders = [];

  @override
  void dispose() {
    productIdController.dispose();
    quantityController.dispose();
    super.dispose();
  }

  Future<void> handlePlaceOrder() async {
    // Validation
    if (productIdController.text.isEmpty || quantityController.text.isEmpty) {
      _showMessage('Please fill in all fields', false);
      return;
    }

    final productId = int.tryParse(productIdController.text);
    final quantity = int.tryParse(quantityController.text);

    if (productId == null || productId <= 0) {
      _showMessage('Product ID must be a valid positive number', false);
      return;
    }

    if (quantity == null || quantity <= 0) {
      _showMessage('Quantity must be a valid positive number', false);
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final response = await apiService.placeOrder(productId, quantity);

      if (response['success'] == true) {
        _showMessage('Order placed successfully!', true);
        setState(() {
          orders.insert(0, response['order']);
        });
        productIdController.clear();
        quantityController.clear();
      } else {
        _showMessage(
          response['error']['message'] ?? 'Failed to place order',
          false,
        );
      }
    } catch (e) {
      _showMessage(e.toString(), false);
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  void _showMessage(String msg, bool success) {
    setState(() {
      message = msg;
      isSuccess = success;
    });

    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          message = null;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📦 Inventory Allocation'),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (message != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: isSuccess ? Colors.green : Colors.red,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    message!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              Card(
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Place Order',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: productIdController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Product ID',
                          hintText: 'Enter product ID',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          enabled: !isLoading,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: quantityController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Quantity',
                          hintText: 'Enter quantity',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          enabled: !isLoading,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: isLoading ? null : handlePlaceOrder,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          isLoading ? 'Processing...' : 'Place Order',
                          style: const TextStyle(fontSize: 16),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Sample Products',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 8),
                            _buildProductInfo('ID 1', 'Laptop', '50'),
                            _buildProductInfo('ID 2', 'Mouse', '200'),
                            _buildProductInfo('ID 3', 'Keyboard', '150'),
                            _buildProductInfo('ID 4', 'Monitor', '30'),
                            _buildProductInfo('ID 5', 'USB Cable', '500'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              if (orders.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Order History',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: orders.length,
                      itemBuilder: (context, index) {
                        final order = orders[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Order #${order['id']}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.green[100],
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        order['status'].toString().toUpperCase(),
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.green,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Product ID: ${order['productId']}',
                                  style: const TextStyle(fontSize: 13),
                                ),
                                Text(
                                  'Quantity: ${order['quantity']}',
                                  style: const TextStyle(fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProductInfo(String id, String name, String stock) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Text(
        '✓ $id: $name ($stock in stock)',
        style: const TextStyle(fontSize: 12),
      ),
    );
  }
}
