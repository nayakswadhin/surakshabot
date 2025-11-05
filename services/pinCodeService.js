const axios = require("axios");

class PinCodeService {
  constructor() {
    // Using India Post PIN Code API
    this.baseUrl = "https://api.postalpincode.in/pincode";
  }

  async getLocationDetails(pincode) {
    try {
      const response = await axios.get(`${this.baseUrl}/${pincode}`);

      if (
        response.data &&
        response.data[0] &&
        response.data[0].Status === "Success"
      ) {
        const postOffices = response.data[0].PostOffice;

        if (postOffices && postOffices.length > 0) {
          const mainPostOffice = postOffices[0];

          return {
            success: true,
            data: {
              postOffice: mainPostOffice.Name,
              district: mainPostOffice.District,
              state: mainPostOffice.State,
              area: mainPostOffice.Block || mainPostOffice.Name,
              // For police station, we'll use a simplified approach
              policeStation: this.generatePoliceStationName(
                mainPostOffice.District,
                mainPostOffice.Block
              ),
            },
          };
        }
      }

      return {
        success: false,
        message: "Invalid PIN code or no data found",
      };
    } catch (error) {
      console.error("Error fetching PIN code details:", error.message);
      return {
        success: false,
        message: "Error fetching location details",
      };
    }
  }

  generatePoliceStationName(district, block) {
    // Generate a likely police station name based on area
    // This is a simplified approach - in real implementation, you'd use a dedicated police station API
    if (block) {
      return `${block} Police Station`;
    }
    return `${district} Police Station`;
  }

  async validatePinCode(pincode) {
    if (!/^[0-9]{6}$/.test(pincode)) {
      return {
        success: false,
        message: "PIN code must be exactly 6 digits",
      };
    }

    const details = await this.getLocationDetails(pincode);
    return details;
  }
}

module.exports = PinCodeService;
