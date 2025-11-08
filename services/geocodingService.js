const axios = require('axios');

class GeocodingService {
  constructor() {
    // India Pincode to coordinates mapping (sample - can be extended)
    this.pincodeCoordinates = require('./pincodeData.json');
  }

  /**
   * Get coordinates from pincode
   * @param {string} pincode - Indian pincode
   * @returns {Promise<{lat: number, lng: number}>}
   */
  async getCoordinatesFromPincode(pincode) {
    try {
      // First check local database
      if (this.pincodeCoordinates[pincode]) {
        return this.pincodeCoordinates[pincode];
      }

      // If not found, use external API (optional)
      // You can use Google Geocoding API or India Post API
      // For now, return approximate coordinates based on district

      // Default to India center if pincode not found
      return {
        lat: 20.5937,
        lng: 78.9629
      };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  /**
   * Get approximate coordinates for major Indian cities and districts
   * @param {string} district - District/City name
   * @returns {Object} - {lat, lng}
   */
  getDistrictCoordinates(district) {
    const locationMap = {
      // Major Indian Cities (National Coverage)
      'Khordha': { lat: 20.1809, lng: 85.6040 },
      'Cuttack': { lat: 20.4625, lng: 85.8830 },
      'Puri': { lat: 19.8135, lng: 85.8312 },
      'Balasore': { lat: 21.4934, lng: 86.9336 },
      'Bhadrak': { lat: 21.0542, lng: 86.4936 },
      'Jajpur': { lat: 20.8449, lng: 86.3267 },
      'Kendrapara': { lat: 20.5020, lng: 86.4217 },
      'Jagatsinghpur': { lat: 20.2626, lng: 86.1746 },
      'Nayagarh': { lat: 20.1281, lng: 85.0960 },
      'Ganjam': { lat: 19.3860, lng: 84.8790 },
      'Gajapati': { lat: 19.3645, lng: 84.1402 },
      'Kandhamal': { lat: 20.1640, lng: 84.0120 },
      'Boudh': { lat: 20.8357, lng: 84.3313 },
      'Sonepur': { lat: 20.8333, lng: 83.9167 },
      'Bolangir': { lat: 20.7099, lng: 83.4855 },
      'Kalahandi': { lat: 19.9080, lng: 83.1660 },
      'Nuapada': { lat: 20.8113, lng: 82.5390 },
      'Rayagada': { lat: 19.1712, lng: 83.4156 },
      'Nabarangpur': { lat: 19.2309, lng: 82.5431 },
      'Koraput': { lat: 18.8134, lng: 82.7114 },
      'Malkangiri': { lat: 18.3481, lng: 81.8897 },
      'Sambalpur': { lat: 21.4669, lng: 83.9812 },
      'Deogarh': { lat: 21.5340, lng: 84.7330 },
      'Bargarh': { lat: 21.3333, lng: 83.6167 },
      'Jharsuguda': { lat: 21.8533, lng: 84.0070 },
      'Sundargarh': { lat: 22.1181, lng: 84.4361 },
      'Angul': { lat: 20.8399, lng: 85.1016 },
      'Dhenkanal': { lat: 20.6647, lng: 85.5985 },
      'Keonjhar': { lat: 21.6291, lng: 85.5824 },
      'Mayurbhanj': { lat: 22.0441, lng: 86.4027 },
      
      // Major Indian Cities
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'New Delhi': { lat: 28.6139, lng: 77.2090 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Bengaluru': { lat: 12.9716, lng: 77.5946 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Kanpur': { lat: 26.4499, lng: 80.3319 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Thane': { lat: 19.2183, lng: 72.9781 },
      'Bhopal': { lat: 23.2599, lng: 77.4126 },
      'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'Patna': { lat: 25.5941, lng: 85.1376 },
      'Vadodara': { lat: 22.3072, lng: 73.1812 },
      'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
      'Ludhiana': { lat: 30.9010, lng: 75.8573 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Nashik': { lat: 19.9975, lng: 73.7898 },
      'Faridabad': { lat: 28.4089, lng: 77.3178 },
      'Meerut': { lat: 28.9845, lng: 77.7064 },
      'Rajkot': { lat: 22.3039, lng: 70.8022 },
      'Varanasi': { lat: 25.3176, lng: 82.9739 },
      'Srinagar': { lat: 34.0837, lng: 74.7973 },
      'Amritsar': { lat: 31.6340, lng: 74.8723 },
      'Allahabad': { lat: 25.4358, lng: 81.8463 },
      'Ranchi': { lat: 23.3441, lng: 85.3096 },
      'Howrah': { lat: 22.5958, lng: 88.2636 },
      'Coimbatore': { lat: 11.0168, lng: 76.9558 },
      'Jodhpur': { lat: 26.2389, lng: 73.0243 },
      'Guwahati': { lat: 26.1445, lng: 91.7362 },
      'Chandigarh': { lat: 30.7333, lng: 76.7794 },
      'Mysore': { lat: 12.2958, lng: 76.6394 },
      'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
      'Kochi': { lat: 9.9312, lng: 76.2673 },
      'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
    };

    return locationMap[district] || { lat: 20.5937, lng: 78.9629 }; // Default to India center
  }

  /**
   * Get coordinates with random offset for better visualization
   * @param {object} baseCoords - Base coordinates
   * @param {number} offset - Offset range in degrees (default 0.05 = ~5km)
   * @returns {object} coordinates with offset
   */
  addRandomOffset(baseCoords, offset = 0.05) {
    return {
      lat: baseCoords.lat + (Math.random() - 0.5) * offset,
      lng: baseCoords.lng + (Math.random() - 0.5) * offset
    };
  }
}

module.exports = new GeocodingService();
