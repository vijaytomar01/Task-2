const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  async placeOrder(productId, quantity) {
    try {
      const response = await fetch(`${API_BASE_URL}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        }),
      });

      // Get the response text first
      const responseText = await response.text();
      
      // Parse as JSON only if there's content
      let data = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response:', responseText);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        throw new Error('No response from server');
      }

      // Check response status
      if (!response.ok) {
        throw new Error(data.error?.message || `Server error: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Better error messages
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to backend. Make sure it is running on http://localhost:5000');
      }
      throw new Error(error.message || 'Network error');
    }
  }
}

export default new APIService();
