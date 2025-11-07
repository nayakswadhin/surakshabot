# 🤖 SurakshaBot - Intelligent Chatbot Feature

## Overview
The SurakshaBot is an intelligent chatbot assistant integrated into the Police Dashboard that helps users query complaint data from MongoDB and provides quick navigation to relevant sections.

## ✨ Features

### 1. **Intelligent Query Understanding**
The chatbot can understand and respond to natural language queries about:
- Total complaints statistics
- Solved/Pending/Under Review cases
- Long pending cases (>30 days)
- Urgent and high priority cases
- Today's, weekly, and monthly complaint counts
- Fraud types and categories
- Analytics and reports

### 2. **Real-time Data from MongoDB**
All responses are powered by real-time data queries from the MongoDB database:
- **Cases Collection**: Complaint details, status, priority, fraud types
- **Dynamic Statistics**: Aggregated data showing current state
- **Historical Analysis**: Time-based filtering and trending

### 3. **Smart Navigation Links**
Every bot response includes contextual navigation buttons that:
- Redirect users to relevant dashboard pages
- Filter complaints by status, priority, or category
- Open analytics or reports sections
- Close the chatbot after navigation for seamless UX

### 4. **Quick Action Buttons**
Pre-defined query buttons for common questions:
- Total Complaints
- Pending Cases
- Solved Cases
- Long Pending
- Urgent Cases
- Today's Cases
- Fraud Types
- Analytics

## 🎯 Supported Queries

### Statistics Queries
```
"How many total complaints?"
"Total complaints"
"Show me all complaints"
```

### Status-based Queries
```
"How many solved cases?"
"Show pending complaints"
"Which cases are under review?"
"Show investigating cases"
```

### Time-based Queries
```
"How many complaints today?"
"This week's cases"
"This month's complaints"
```

### Priority Queries
```
"Show urgent cases"
"High priority complaints"
"Critical cases"
```

### Long Pending Queries
```
"Long pending cases"
"Which cases are pending for long time?"
"Show old pending complaints"
```

### Category & Fraud Type Queries
```
"Show fraud types"
"Financial fraud cases"
"Social media fraud"
"What are the most common frauds?"
```

### Navigation Queries
```
"Show analytics"
"View reports"
"Check complaint status"
```

## 🔧 API Endpoints

### 1. **GET /api/chatbot/stats**
Fetches comprehensive statistics from MongoDB.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "solved": 80,
      "pending": 45,
      "under_review": 15,
      "investigating": 8,
      "rejected": 2
    },
    "byPriority": {
      "urgent": 10,
      "high": 25
    },
    "longPending": 12,
    "timeBasedStats": {
      "today": 5,
      "thisWeek": 23,
      "thisMonth": 67
    },
    "categoryBreakdown": {
      "Financial": 95,
      "Social": 55
    },
    "topFraudTypes": {
      "UPI Fraud": 35,
      "Investment Fraud": 28,
      "Social Media Fraud": 22
    }
  }
}
```

### 2. **POST /api/chatbot/query**
Processes natural language queries and returns intelligent responses.

**Request:**
```json
{
  "message": "How many pending complaints?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "⏳ **Pending Complaints: 45**\n\n⚠️ Long Pending (>30 days): 12\n\nThese cases require immediate attention!",
  "data": {
    "pending": 45,
    "longPending": 12
  },
  "links": [
    {
      "text": "View Pending Cases",
      "url": "/complaints?status=pending"
    },
    {
      "text": "View Long Pending",
      "url": "/complaints?status=pending&days=30"
    }
  ]
}
```

## 📊 Query Processing Logic

The chatbot uses natural language understanding to match user queries:

1. **Keyword Matching**: Identifies intent from keywords (total, pending, solved, urgent, etc.)
2. **MongoDB Aggregation**: Runs optimized queries to fetch real-time data
3. **Response Generation**: Creates formatted responses with statistics
4. **Link Generation**: Provides contextual navigation links
5. **Error Handling**: Graceful fallback for unrecognized queries

## 🎨 UI Components

### ChatBot Button
- **Location**: Bottom-right corner of all pages (except login)
- **States**: 
  - Collapsed: Floating button with "Need Help?" text
  - Expanded: Full chat window (396px × 600px)

### Chat Window Features
- **Header**: Bot branding with close button
- **Messages**: User/bot message bubbles with timestamps
- **Navigation Buttons**: Clickable links below bot messages
- **Quick Actions**: Pre-defined query buttons (shown on first load)
- **Input Area**: Text input with send button
- **Typing Indicator**: Animated dots while processing

## 💡 Usage Examples

### Example 1: Check Total Complaints
**User**: "How many total complaints?"

**Bot Response**:
```
📊 Total Complaints: 150

Here's the breakdown:
✅ Solved: 80
⏳ Pending: 45
🔍 Under Review: 15
🕵️ Investigating: 8
❌ Rejected: 2

[View All Complaints →]
```

### Example 2: Long Pending Cases
**User**: "Which cases are pending for long time?"

**Bot Response**:
```
⚠️ Long Pending Cases: 12

These cases have been pending for more than 30 days and need urgent attention!

🚨 Oldest Pending Cases:
1. CASE-2024-001 - UPI Fraud (45 days old)
2. CASE-2024-015 - Investment Fraud (38 days old)
3. CASE-2024-023 - Social Media Fraud (35 days old)

[View All Long Pending →]
```

### Example 3: Today's Complaints
**User**: "How many complaints today?"

**Bot Response**:
```
📅 Today's Complaints: 5

New cases registered today.

[View Today's Cases →]
```

## 🔄 Navigation Flow

1. User clicks chatbot button
2. Chatbot opens with welcome message showing quick stats
3. User types query or clicks quick action button
4. Bot fetches data from MongoDB via API
5. Bot displays formatted response with statistics
6. User clicks navigation link
7. Redirected to target page
8. Chatbot closes automatically

## 🛠️ Technical Implementation

### Backend (Node.js/Express)
- **File**: `/routes/chatbot.js`
- **Database**: MongoDB with Mongoose ODM
- **Models**: Cases, Users
- **Aggregations**: Status counts, time-based filters, fraud type grouping

### Frontend (Next.js/React)
- **File**: `/frontend/components/ChatBot.tsx`
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js useRouter for navigation
- **Styling**: Tailwind CSS with animations
- **Icons**: React Icons (Font Awesome)

## 🚀 Performance Optimizations

1. **Parallel Queries**: Uses `Promise.all()` for concurrent MongoDB queries
2. **Indexed Fields**: Database indexes on status, createdAt, priority
3. **Smart Caching**: Initial stats loaded on component mount
4. **Lazy Loading**: Chatbot component only renders when needed
5. **Debounced Input**: Prevents API spam on rapid typing

## 🔐 Security Considerations

1. **Input Sanitization**: All user inputs are validated
2. **Error Handling**: Graceful error messages without exposing system details
3. **Rate Limiting**: (TODO) Add rate limiting to prevent API abuse
4. **Authentication**: (TODO) Integrate with user authentication

## 📈 Future Enhancements

- [ ] Voice input support
- [ ] Multi-language support (Hindi, Odia)
- [ ] Export chat history
- [ ] Advanced NLP with machine learning
- [ ] Sentiment analysis for user satisfaction
- [ ] Proactive notifications based on user role
- [ ] Integration with WhatsApp bot for unified experience
- [ ] Case-specific deep dive queries (e.g., "Show me details of CASE-123")

## 🐛 Known Issues

None currently reported.

## 📞 Support

For issues or enhancements, contact the development team or file an issue in the repository.

---

**Last Updated**: November 7, 2025
**Version**: 1.0.0
