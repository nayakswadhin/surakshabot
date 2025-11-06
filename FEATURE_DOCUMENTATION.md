# 🛡️ SurakshaBot - WhatsApp Cyber Helpline Bot

## 📋 Project Overview

**SurakshaBot** is an intelligent WhatsApp chatbot designed for the **1930 Cyber Helpline, Odisha** to help citizens file cyber crime complaints efficiently. The bot provides a user-friendly interface for reporting various types of cyber fraud and manages the entire complaint lifecycle.

---

## 🏗️ Project Architecture

```
SurakshaBot-Chatbot/
├── 📁 config/           # Database and configuration files
├── 📁 controllers/      # Request handlers and business logic
├── 📁 models/          # MongoDB database schemas
├── 📁 routes/          # API route definitions
├── 📁 services/        # Core business logic and external services
├── 📄 main.js          # Application entry point
├── 📄 package.json     # Project dependencies and scripts
└── 📄 .env            # Environment variables
```

---

## 🚀 Core Features

### 1. **User Registration & Management**

- **Automatic user detection** and registration
- **Profile management** with personal details
- **Session management** across conversations
- **Data persistence** in MongoDB

### 2. **Multi-Type Fraud Complaint System**

#### 🏦 Financial Fraud Workflow

- UPI fraud complaints
- Bank account fraud
- Credit/Debit card fraud
- Digital wallet fraud
- Investment fraud

#### 📱 Social Media Fraud Workflow (Enhanced)

- Facebook fraud
- Instagram fraud
- X (Twitter) fraud
- LinkedIn fraud
- YouTube fraud
- TikTok fraud
- Snapchat fraud
- WhatsApp fraud
- Telegram fraud
- Other social media platforms

### 3. **Advanced Document Management**

- **Multi-format support**: JPG, PNG, GIF, WebP
- **Cloud storage** via Cloudinary
- **Automatic file validation** and processing
- **Document categorization** by fraud type
- **Image compression** and optimization

### 4. **Smart Conversation Flow**

- **State management** for complex workflows
- **Step-by-step navigation** with back functionality
- **Context-aware responses**
- **Error handling** and recovery
- **Session persistence**

### 5. **Enhanced Social Media Features**

- **Meta registration tracking**
- **Impersonation case detection**
- **URL validation** for social media links
- **Multiple document collection**
- **Final confirmation workflow**

---

## 📂 File Structure & Responsibilities

### 🎯 **Core Application Files**

#### `main.js` - Application Entry Point

**Features:**

- Express server initialization
- Middleware configuration
- Database connection setup
- Webhook endpoint configuration
- Request logging
- Error handling

**Key Functions:**

- Server startup and configuration
- WhatsApp webhook verification
- Request routing and middleware

---

### 🎮 **Controllers (`controllers/`)**

#### `controllers/whatsappController.js` - Message Processing Controller

**Features:**

- **Webhook verification** for WhatsApp Business API
- **Message type detection** (text, image, interactive)
- **User session management**
- **Button click handling**
- **Image message processing**
- **Error handling** and logging

**Key Functions:**

```javascript
-verifyWebhook() - // WhatsApp webhook verification
  handleWebhook() - // Process incoming messages
  handleTextMessage() - // Text message processing
  handleImageMessage() - // Image upload handling
  handleButtonClick() - // Interactive button responses
  saveUserRegistration(); // User registration handling
```

---

### 🗃️ **Models (`models/`)**

#### `models/Users.js` - User Data Schema

**Features:**

- User profile storage
- Personal information management
- Case ID tracking
- Registration status

**Schema Fields:**

```javascript
-phoneNumber - // User's WhatsApp number
  name - // Full name
  fatherName - // Father/Spouse/Guardian name
  email - // Email address
  village - // Village/Area
  district - // District
  caseIds - // Array of filed case IDs
  createdAt; // Registration timestamp
```

#### `models/Cases.js` - Case Management Schema

**Features:**

- Case information storage
- Fraud type categorization
- Status tracking
- Police station mapping

**Schema Fields:**

```javascript
-caseId - // Unique case identifier
  userId - // Reference to user
  fraudType - // Type of fraud
  incidentDate - // When incident occurred
  incidentDetails - // Detailed description
  status - // Case status
  policeStation - // Assigned police station
  caseDetailsId; // Reference to detailed documents
```

#### `models/CaseDetails.js` - Document & Evidence Schema

**Features:**

- Document storage and management
- Social media fraud specific fields
- URL collection for evidence
- File metadata tracking

**Schema Fields:**

```javascript
- photos[]                // Document images array
  - documentType          // Type of document
  - url                   // Cloudinary URL
  - fileName              // Original filename
  - publicId              // Cloudinary public ID
  - uploadedAt            // Upload timestamp
- metaRegistrationDone    // Meta registration status
- isImpersonationCase     // Impersonation flag
- allegedUrls[]           // Fraudulent URLs
- originalIdUrls[]        // Original profile URLs
```

---

### ⚙️ **Services (`services/`)**

#### `services/whatsappService.js` - Core Bot Logic

**Main Features:**

- **Message processing** and response generation
- **Workflow orchestration** for different fraud types
- **Session state management**
- **Button and menu handling**
- **Document collection workflows**

**Key Functions:**

##### **General Bot Functions:**

```javascript
-handleButtonPress() - // Process button clicks
  handleNewComplaint() - // Start new complaint flow
  isGreeting() - // Detect greeting messages
  handleExitSession() - // End user session
  handleBackStep(); // Navigate to previous step
```

##### **Financial Fraud Functions:**

```javascript
-handleFinancialFraudType() - // Process financial fraud selection
  requestFinancialDocument() - // Request specific documents
  processDocumentUpload() - // Handle document uploads
  completeFinancialComplaint(); // Finalize financial fraud case
```

##### **Social Media Fraud Functions:**

```javascript
-handleSocialMediaFraudType() - // Process social media fraud selection
  requestSocialMediaDocument() - // Request social media documents
  handleSocialMediaBackStep() - // Handle back navigation
  moveToNextSocialMediaStep() - // Progress through workflow
  askImpersonationQuestion() - // Ask about impersonation
  handleImpersonationResponse() - // Process impersonation answer
  askFinalConfirmation() - // Final confirmation screen
  handleSocialMediaUrlInput() - // Validate and process URLs
  completeSocialMediaComplaint() - // Finalize social media case
  getFraudTypeDisplay(); // Get display name for fraud types
```

##### **Utility Functions:**

```javascript
-createTextMessage() - // Create text message objects
  createNavigationMessage() - // Create button messages
  sendMessage() - // Send messages via WhatsApp API
  uploadImageToCloudinary(); // Upload images to cloud storage
```

#### `services/sessionManager.js` - Session Management

**Features:**

- **User session tracking**
- **State persistence** across conversations
- **Workflow step management**
- **Data storage** during conversation

**Key Functions:**

```javascript
-createSession() - // Initialize new user session
  getSession() - // Retrieve existing session
  updateSession() - // Update session data
  clearSession(); // End and cleanup session
```

**Session States:**

```javascript
-MENU - // Main menu state
  USER_REGISTRATION - // User registration flow
  COMPLAINT_FILING - // Complaint creation
  DOCUMENT_COLLECTION - // Document upload phase
  SOCIAL_MEDIA_COLLECTION; // Social media specific flow
```

**Social Media Collection Steps:**

```javascript
-META_LINK - // Meta registration link
  META_CONFIRMATION - // Meta registration confirmation
  REQUEST_LETTER - // Meta acknowledgment document
  GOVT_ID - // Government ID document
  DISPUTED_SCREENSHOTS - // Fraudulent content screenshots
  ALLEGED_URL - // Fraudulent URLs
  IMPERSONATION_CHECK - // Check for impersonation
  ORIGINAL_ID_SCREENSHOT - // Original profile screenshot
  ORIGINAL_ID_URL - // Original profile URL
  FINAL_CONFIRMATION - // Final user confirmation
  COMPLETION; // Case completion
```

#### `services/complaintService.js` - Complaint Processing

**Features:**

- **Fraud type management**
- **Message template generation**
- **Complaint workflow coordination**

**Key Functions:**

```javascript
-createSocialMediaFraudTypesMessage() - // Social media fraud options
  createFinancialFraudTypesMessage() - // Financial fraud options
  getPoliceStationForPincode(); // Police station mapping
```

#### `services/cloudinaryService.js` - File Management

**Features:**

- **Image upload** to Cloudinary
- **File compression** and optimization
- **Public URL generation**
- **File deletion** capabilities

**Key Functions:**

```javascript
-uploadImage() - // Upload image to cloud
  deleteImage() - // Remove image from cloud
  getImageUrl(); // Get public URL
```

#### `services/pinCodeService.js` - Location Services

**Features:**

- **PIN code validation**
- **Police station mapping**
- **Geographic data management**

---

### 🛣️ **Routes (`routes/`)**

#### `routes/whatsapp.js` - API Endpoints

**Features:**

- **Webhook verification** endpoints
- **Message processing** endpoints
- **Health check** endpoints

#### `routes/index.js` - Route Aggregation

**Features:**

- **Central route management**
- **API versioning**
- **Route organization**

---

### ⚙️ **Configuration (`config/`)**

#### `config/database.js` - Database Configuration

**Features:**

- **MongoDB connection** setup
- **Connection pooling**
- **Error handling** for database
- **Environment-based** configuration

---

## 🔄 **Workflow Diagrams**

### Financial Fraud Workflow

```
Start → User Registration → Fraud Type Selection → Document Collection → Case Creation → Completion
```

### Social Media Fraud Workflow (Enhanced)

```
Start → User Registration → Fraud Type Selection → Meta Registration → Document Collection → URL Collection → Impersonation Check → [If Yes: Additional Documents] → Final Confirmation → Case Creation → Completion
```

---

## 🛠️ **Technology Stack**

### **Backend Framework**

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### **External Services**

- **WhatsApp Business API** - Messaging platform
- **Cloudinary** - Image storage and processing
- **Axios** - HTTP client for API calls

### **Development Tools**

- **Nodemon** - Development server
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing
- **Body-parser** - Request parsing

---

## 🔐 **Security Features**

### **Data Protection**

- **Environment variables** for sensitive data
- **Webhook verification** for WhatsApp
- **Input validation** and sanitization
- **Session isolation** per user

### **File Security**

- **File type validation**
- **Size limitations**
- **Secure cloud storage**
- **Public ID tracking** for deletion

---

## 📊 **Key Metrics & Features**

### **Performance Features**

- **Asynchronous processing**
- **Connection pooling**
- **Error recovery**
- **Graceful degradation**

### **User Experience Features**

- **Multi-language support** potential
- **Intuitive navigation**
- **Clear error messages**
- **Progress tracking**

---

## 🚀 **Setup & Installation**

### **Prerequisites**

- Node.js (v14 or higher)
- MongoDB database
- WhatsApp Business API account
- Cloudinary account

### **Environment Variables**

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
WHATSAPP_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verification_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### **Installation Steps**

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd SurakshaBot-Chatbot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the application
npm start

# For development
npm run dev
```

---

## 🧪 **Testing**

### **Available Test Files**

- `test-database.js` - Database connection testing
- `test-endpoints.js` - API endpoint testing
- `TESTING_GUIDE.md` - Comprehensive testing guide

---

## 📚 **Documentation Files**

- **`README.md`** - Basic project information
- **`FLOW_DOCUMENTATION.md`** - Workflow documentation
- **`TESTING_GUIDE.md`** - Testing procedures
- **`FEATURE_DOCUMENTATION.md`** - This comprehensive guide

---

## 🤝 **Contributing**

### **Development Guidelines**

1. **Follow naming conventions** for files and functions
2. **Add comments** for complex logic
3. **Test thoroughly** before committing
4. **Update documentation** when adding features

### **File Naming Conventions**

- **Services**: `serviceNameService.js`
- **Controllers**: `controllerNameController.js`
- **Models**: `ModelName.js` (PascalCase)
- **Routes**: `routeName.js`

---

## 📞 **Support & Contact**

For technical support or questions about this codebase, refer to the individual file comments and function documentation. Each service and controller file contains detailed JSDoc comments explaining the purpose and usage of each function.

---

**Last Updated**: November 6, 2025  
**Version**: 1.0.0  
**Author**: Suraksha Bot Team
