# Real-Time Notification System

## Overview
The SurakshaBot application now features a real-time notification system using WebSocket (Socket.IO) for instant updates about complaints, status changes, and user registrations.

## Features

### ✅ Implemented Features

1. **WebSocket Server** (Backend)
   - Real-time bidirectional communication
   - Auto-reconnection on connection loss
   - CORS enabled for frontend access
   - Connected clients tracking

2. **Notification Panel** (Frontend)
   - Bell icon with unread count badge
   - Animated pulse effect for new notifications
   - Dropdown panel with notification list
   - Mark as read/unread functionality
   - Delete individual notifications
   - Clear all notifications
   - Mark all as read
   - Timestamp display
   - Notification type icons (🚨, 🔄, 👤, 📢)

3. **Notification Types**
   - **New Complaint**: When a new complaint is registered
   - **Status Update**: When complaint status changes
   - **New User**: When a new user registers
   - **General**: Custom notifications

4. **Test Functionality**
   - Test notification button in Settings page
   - API endpoint: `POST /api/test-notification`

## Architecture

### Backend Components

```
surakshabot/
├── main.js                              # WebSocket server initialization
├── services/
│   └── notificationService.js          # Notification emission logic
├── controllers/
│   └── whatsappController.js           # Emits notifications on complaint creation
└── routes/
    └── index.js                         # Test notification endpoint
```

### Frontend Components

```
frontend/
├── lib/
│   └── socket.ts                        # WebSocket client connection
├── components/
│   └── Header.tsx                       # Notification UI and handling
└── app/
    └── settings/
        └── page.tsx                     # Test notification button
```

## How It Works

### 1. WebSocket Connection Flow

```
Frontend (Next.js)           Backend (Express + Socket.IO)
      |                              |
      |-------- Connect ------------>|
      |                              |
      |<--- Connection Success ------|
      |                              |
      |                              | (New Complaint Created)
      |                              |
      |<--- notification event ------|
      |                              |
      | (Display in UI)              |
```

### 2. Notification Emission

When a complaint is created:
```javascript
// In whatsappController.js
const savedCase = await newCase.save();
NotificationService.emitNewComplaint(savedCase);
```

The notification service broadcasts to all connected clients:
```javascript
global.io.emit('notification', notificationObject);
```

### 3. Frontend Reception

The Header component listens for notifications:
```typescript
socket.on('notification', (notification: Notification) => {
  setNotifications((prev) => [notification, ...prev])
})
```

## Usage

### Starting the Application

1. **Start Backend with WebSocket**:
```powershell
cd d:\cyberproject\surakshabot
node main.js
```

Expected output:
```
🚀 ================================
🤖 Suraksha Bot Server Started
📱 WhatsApp Bot Service Running
🌐 Server: http://localhost:3000
🔌 WebSocket: ws://localhost:3000
📊 Health Check: http://localhost:3000/api/health
🔗 Webhook URL: http://localhost:3000/api/whatsapp/webhook
🚀 ================================
```

2. **Start Frontend**:
```powershell
cd d:\cyberproject\surakshabot\frontend
npm run dev
```

3. **Test Notifications**:
   - Navigate to Settings page
   - Click "Test Notification" button
   - Check the notification bell icon in header

### Manual Testing via API

Send a test notification using curl or Postman:

```bash
curl -X POST http://localhost:3000/api/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Alert",
    "message": "This is a manual test notification",
    "data": {"priority": "high"}
  }'
```

## API Reference

### WebSocket Events

#### Client → Server
- `connect` - Automatic on connection
- `disconnect` - Automatic on disconnection

#### Server → Client
- `notification` - Notification payload sent to all clients

### Notification Object Structure

```typescript
{
  id: string              // Unique notification ID
  type: string            // 'new_complaint' | 'status_update' | 'new_user' | 'general'
  title: string           // Notification title
  message: string         // Notification message
  data: object            // Additional metadata
  timestamp: string       // ISO timestamp
  read: boolean           // Read status
}
```

### REST Endpoints

#### Test Notification
```http
POST /api/test-notification
Content-Type: application/json

{
  "title": "Notification Title",
  "message": "Notification message content",
  "data": {} // Optional additional data
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent",
  "timestamp": "2025-11-07T..."
}
```

## Notification Service Methods

### emitNewComplaint(complaint)
Emits a notification when a new complaint is registered.

```javascript
NotificationService.emitNewComplaint({
  _id: "complaint123",
  name: "John Doe",
  caseCategory: "Financial",
  status: "pending"
});
```

### emitStatusUpdate(complaint, oldStatus)
Emits a notification when complaint status changes.

```javascript
NotificationService.emitStatusUpdate(complaint, "pending");
```

### emitNewUser(user)
Emits a notification when a new user registers.

```javascript
NotificationService.emitNewUser({
  _id: "user123",
  name: "Jane Smith",
  aadharNumber: "1234-5678-9012"
});
```

### emitNotification(title, message, data)
Emits a general notification.

```javascript
NotificationService.emitNotification(
  "System Alert",
  "Database backup completed",
  { backupSize: "2.5GB" }
);
```

## UI Features

### Notification Bell
- Real-time unread count badge
- Animated pulse for new notifications
- Click to toggle notification panel

### Notification Panel
- **Header Actions**:
  - Mark all as read
  - Clear all notifications
  
- **Individual Notification**:
  - Icon based on type
  - Title and message
  - Timestamp
  - Mark as read button
  - Delete button
  - Blue highlight for unread

- **Empty State**:
  - Friendly message when no notifications

## Future Enhancements

1. **Persistence**
   - Store notifications in database
   - Load recent notifications on login
   - Notification history page

2. **Advanced Features**
   - Sound preferences
   - Desktop notifications (browser API)
   - Email notifications
   - SMS notifications via Twilio
   - Push notifications for mobile

3. **Filtering & Search**
   - Filter by notification type
   - Search notifications
   - Date range filtering

4. **User Preferences**
   - Notification preferences per type
   - Quiet hours
   - Notification frequency limits

5. **Analytics**
   - Notification delivery metrics
   - User engagement tracking
   - Most common notification types

## Troubleshooting

### Notifications Not Appearing

1. **Check WebSocket Connection**:
   - Open browser DevTools → Console
   - Look for: `🔌 Connected to WebSocket server`

2. **Check Backend Logs**:
   - Should see: `🔌 Client connected: <socket-id>`

3. **Test Connection**:
   - Go to Settings page
   - Click "Test Notification"
   - Check browser console for errors

### Connection Issues

**Problem**: `WebSocket connection error`

**Solutions**:
- Ensure backend is running on port 3000
- Check CORS configuration in main.js
- Verify firewall settings
- Try different transport: `transports: ['polling', 'websocket']`

**Problem**: Notifications work initially then stop

**Solutions**:
- Check for browser tab sleep mode
- Implement reconnection logic (already added)
- Check server logs for disconnection events

## Security Considerations

1. **Authentication**: Add socket authentication
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

2. **Rate Limiting**: Prevent notification spam
3. **Data Validation**: Sanitize notification content
4. **Encryption**: Use WSS (WebSocket Secure) in production

## Production Deployment

### Backend
1. Use environment variables for WebSocket URL
2. Enable WSS (secure WebSocket)
3. Add authentication middleware
4. Implement rate limiting
5. Add monitoring and logging

### Frontend
1. Update socket URL to production server
2. Add reconnection with exponential backoff
3. Handle network offline/online events
4. Add error boundaries

### Example Production Config
```javascript
const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
  secure: true,
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});
```

## Testing

### Manual Testing Checklist
- [ ] Open two browser windows
- [ ] Login in both
- [ ] Create a test notification from Settings
- [ ] Verify both windows receive notification
- [ ] Test mark as read
- [ ] Test delete notification
- [ ] Test clear all
- [ ] Test mark all as read
- [ ] Refresh page - notifications should persist in state
- [ ] Close and reopen - notifications reset (no persistence yet)

### Automated Testing
Consider adding:
- Socket.IO client tests
- Component tests for notification UI
- Integration tests for end-to-end flow
- Load testing for multiple concurrent clients

## Support

For issues or questions:
- Check console logs (both browser and server)
- Review this documentation
- Check Socket.IO documentation: https://socket.io/docs/

---

**Version**: 1.0.0  
**Last Updated**: November 7, 2025  
**Author**: SurakshaBot Development Team
