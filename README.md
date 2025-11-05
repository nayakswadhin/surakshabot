# SurakshaBot - WhatsApp Cyber Crime Helpline

A WhatsApp bot for 1930 Cyber Helpline, Odisha to help citizens report cyber crimes and get assistance.

## Features

- 🤖 Interactive WhatsApp bot with clickable buttons
- 📱 Menu-driven interface for easy navigation
- 🔐 Secure complaint registration system
- 📊 Case status tracking
- 🏦 Account unfreeze support
- 📋 Comprehensive complaint management

## Menu Options

When users say "Hello", "Hi", "Help", or similar greetings, the bot responds with:

**"Welcome to 1930, Cyber Helpline, Odisha. How can I help you?"**

And provides these clickable options:

- **A - For New Complaint**
- **B - For Status Check in Existing Complaint**
- **C - For Account unfreeze related**
- **D - Other Queries**

## Project Structure

```
SurakshaBot-Chatbot/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── whatsappController.js # WhatsApp bot logic and handlers
├── models/
│   ├── Users.js             # User schema
│   ├── Cases.js             # Cases schema
│   ├── CaseDetails.js       # Case details schema
│   └── index.js             # Model exports
├── routes/
│   ├── whatsapp.js          # WhatsApp routes
│   └── index.js             # Main routes
├── services/
│   └── whatsappService.js   # WhatsApp API service
├── .env                     # Environment variables
├── main.js                  # Express server entry point
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SurakshaBot-Chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Update your `.env` file with the correct values:
   ```env
   WHATSAPP_TOKEN=your_whatsapp_token
   PHONE_NUMBER_ID=your_phone_number_id
   WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
   PORT=3000
   GRAPH_API_URL=https://graph.facebook.com/v22.0
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=suraksha_bot
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

- **GET** `/api/health` - Check if the service is running

### WhatsApp Webhook

- **GET** `/api/whatsapp/webhook` - Webhook verification
- **POST** `/api/whatsapp/webhook` - Receive WhatsApp messages

### Cases Management

- **GET** `/api/whatsapp/cases/:aadharNumber` - Get cases by Aadhar number
- **POST** `/api/whatsapp/cases` - Create a new case

## Webhook Setup

1. **Configure Meta Developer Console**

   - Go to Meta for Developers
   - Set webhook URL: `https://your-domain.com/api/whatsapp/webhook`
   - Set verify token: Your `WEBHOOK_VERIFY_TOKEN` from `.env`

2. **Subscribe to webhook fields:**
   - messages
   - message_deliveries
   - message_reads
   - message_reactions

## Database Schemas

### Users Schema

- Aadhar Number (unique identifier)
- Personal details (name, father/spouse name, gender, etc.)
- Contact information (email, phone)
- Address details
- Associated case IDs

### Cases Schema

- Aadhar Number
- Incident description
- Case category (Financial/Social)
- Type of fraud (extensive list of fraud types)
- Status (pending/solved)
- Case details reference

### Case Details Schema

- Case ID reference
- Photos/evidence
- Police station assignment
- Timestamps

## Bot Flow

1. **Greeting Detection**: Bot detects greetings like "Hello", "Hi", "Help"
2. **Welcome Message**: Displays welcome message with clickable buttons
3. **Menu Options**: User selects from 4 main options
4. **Data Collection**: Bot collects necessary information based on user choice
5. **Processing**: Information is stored in MongoDB
6. **Confirmation**: User receives confirmation and next steps

## Supported Fraud Types

### Financial Fraud

- Investment/Trading/IPO Fraud
- Customer Care Fraud
- UPI Fraud (UPI/IMPS/INB/NEFT/RTGS)
- APK Fraud
- Online Job Fraud
- E-Commerce Fraud
- And many more...

### Social Media Fraud

- Facebook Fraud
- Instagram Fraud
- WhatsApp Fraud
- Telegram Fraud
- And more...

## Error Handling

- Comprehensive error logging
- Graceful failure handling
- User-friendly error messages
- Automatic retry mechanisms

## Security Features

- Input validation using Mongoose schemas
- Aadhar number format validation
- Phone number validation
- Secure token-based authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical support or queries:

- Email: cybercrime.odisha@gov.in
- Helpline: 1930
- Visit nearest police station

## License

This project is licensed under the MIT License.

---

**Developed for 1930 Cyber Helpline, Odisha** 🚔💻
