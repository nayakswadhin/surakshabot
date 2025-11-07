/**
 * Notification Service
 * Handles real-time notifications via WebSocket
 */

class NotificationService {
  /**
   * Emit a new complaint notification
   * @param {Object} complaint - The complaint object
   */
  static emitNewComplaint(complaint) {
    if (global.io) {
      const notification = {
        id: Date.now().toString(),
        type: 'new_complaint',
        title: 'New Complaint Received',
        message: `New ${complaint.caseCategory || 'complaint'} from ${complaint.name}`,
        data: {
          complaintId: complaint._id,
          name: complaint.name,
          category: complaint.caseCategory,
          status: complaint.status
        },
        timestamp: new Date().toISOString(),
        read: false
      };

      global.io.emit('notification', notification);
      console.log('📢 Notification sent: New complaint');
      return notification;
    }
  }

  /**
   * Emit a complaint status update notification
   * @param {Object} complaint - The complaint object
   * @param {String} oldStatus - Previous status
   */
  static emitStatusUpdate(complaint, oldStatus) {
    if (global.io) {
      const complaintId = complaint._id?.toString() || complaint._id;
      const shortId = complaintId?.substring(0, 8) || 'Unknown';
      
      const notification = {
        id: Date.now().toString(),
        type: 'status_update',
        title: 'Complaint Status Updated',
        message: `Complaint #${shortId} status changed from ${oldStatus} to ${complaint.status}`,
        data: {
          complaintId: complaint._id,
          oldStatus,
          newStatus: complaint.status,
          name: complaint.name
        },
        timestamp: new Date().toISOString(),
        read: false
      };

      global.io.emit('notification', notification);
      console.log('📢 Notification sent: Status update');
      return notification;
    }
  }

  /**
   * Emit a new user registration notification
   * @param {Object} user - The user object
   */
  static emitNewUser(user) {
    if (global.io) {
      const notification = {
        id: Date.now().toString(),
        type: 'new_user',
        title: 'New User Registered',
        message: `${user.name} has registered with Aadhar ${user.aadharNumber}`,
        data: {
          userId: user._id,
          name: user.name,
          aadharNumber: user.aadharNumber
        },
        timestamp: new Date().toISOString(),
        read: false
      };

      global.io.emit('notification', notification);
      console.log('📢 Notification sent: New user');
      return notification;
    }
  }

  /**
   * Emit a general notification
   * @param {String} title - Notification title
   * @param {String} message - Notification message
   * @param {Object} data - Additional data
   */
  static emitNotification(title, message, data = {}) {
    if (global.io) {
      const notification = {
        id: Date.now().toString(),
        type: 'general',
        title,
        message,
        data,
        timestamp: new Date().toISOString(),
        read: false
      };

      global.io.emit('notification', notification);
      console.log('📢 Notification sent:', title);
      return notification;
    }
  }
}

module.exports = NotificationService;
