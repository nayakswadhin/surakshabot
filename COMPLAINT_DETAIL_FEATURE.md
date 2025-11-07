# Complaint Detail Page - Feature Documentation

## 🎯 Overview
A comprehensive complaint detail view system that allows admins to view full complaint information, user details, evidence, and manage status updates with remarks and history tracking.

## ✅ What Was Built

### Backend Components

#### 1. Enhanced Cases Model
**File:** `models/Cases.js`

**New Fields Added:**
```javascript
{
  status: {
    type: String,
    enum: ["pending", "solved", "under_review", "investigating", "rejected"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  remarks: String,
  statusHistory: [{
    status: String,
    remarks: String,
    updatedBy: String,
    updatedAt: Date,
  }],
  assignedTo: {
    officerId: String,
    officerName: String,
    assignedAt: Date,
  },
}
```

**Features:**
- ✅ Multiple status options (5 states)
- ✅ Priority levels (4 levels)
- ✅ Remarks/notes field
- ✅ Status history tracking
- ✅ Officer assignment capability

#### 2. Enhanced API Endpoints

**GET /api/whatsapp/case/:caseId**
- Fetches single complaint with all details
- Includes populated caseDetailsId (photos/evidence)
- Includes user information (auto-fetched by aadharNumber)
- Returns: `{ complaint, user }`

**PATCH /api/whatsapp/cases/:caseId**
- Updates complaint status with remarks
- Adds entry to status history
- Emits real-time notification on status change
- Parameters:
  ```json
  {
    "status": "under_review",
    "remarks": "Documents verified, proceeding with investigation",
    "updatedBy": "Officer Kumar",
    "priority": "high"
  }
  ```

### Frontend Components

#### 1. Complaint Detail Page
**File:** `app/complaints/[id]/page.tsx`

**Sections:**

**A. Header Section**
- Back to complaints button
- Case ID display
- Priority badge (color-coded)
- Status badge (color-coded with icons)

**B. Complaint Information Card**
- Category and fraud type
- Incident description
- Created/updated timestamps
- Latest remarks (highlighted)
- "Update Status" button

**C. Status Update Form** (Collapsible)
- Status dropdown (5 options)
- Priority dropdown (4 levels)
- Remarks textarea
- Updated by field
- Save/Cancel buttons
- Inline validation

**D. Status History Timeline**
- Chronological list of all status changes
- Shows status, remarks, updatedBy, timestamp
- Numbered timeline indicators
- Visual status badges for each entry

**E. Evidence & Attachments Gallery**
- Grid view of uploaded photos/documents
- Click to view fullscreen
- Image modal viewer with close button
- Filename display
- Hover effects

**F. User Information Sidebar**
- Complete user profile
- Name, father/guardian name
- Phone, email
- Aadhar number
- Date of birth, gender
- Full address (village to PIN)
- Account freeze status indicator

**G. Quick Actions Panel**
- Call User button
- Send Email button
- Send WhatsApp button
- Print Report button

**Design Features:**
- Responsive layout (mobile-friendly)
- Color-coded status badges
- Icon-based UI elements
- Loading states
- Error handling
- Smooth transitions
- Modal image viewer

#### 2. Updated Complaints List Page
**File:** `app/complaints/page.tsx`

**Changes:**
- Case ID now clickable (navigates to detail)
- View button navigates to detail page
- Uses useRouter for navigation
- Fixed API call signature

#### 3. Enhanced API Library
**File:** `lib/api.ts`

**Updated Functions:**
```typescript
// Fixed to use correct endpoint
fetchComplaintById(caseId: string)
// Returns: { complaint, user }

// Enhanced to accept full data object
updateComplaintStatus(caseId: string, data: {
  status: string
  remarks?: string
  updatedBy?: string
  priority?: string
})
```

---

## 🎨 UI/UX Features

### Visual Elements

**Status Badges:**
- 🟡 Pending - Yellow
- 🟢 Solved - Green
- 🔵 Under Review - Blue
- 🟣 Investigating - Purple
- 🔴 Rejected - Red

**Priority Badges:**
- ⚪ Low - Gray
- 🔵 Medium - Blue
- 🟠 High - Orange
- 🔴 Urgent - Red

**Icons:**
- User info sections - Contextual icons
- Form fields - Visual indicators
- Actions - Clear button labels
- Evidence - Image icon
- History - Timeline icon

### Responsive Design
- Desktop: 3-column layout (2+1)
- Tablet: 2-column layout
- Mobile: Single column stack
- Image gallery: Responsive grid (3→2→1 columns)

---

## 🔄 Workflow

### Viewing a Complaint

```
1. Admin clicks complaint from table
   ↓
2. Navigate to /complaints/[id]
   ↓
3. Page loads complaint + user data
   ↓
4. Display all information in sections
   ↓
5. Admin reviews details
```

### Updating Status

```
1. Click "Update Status" button
   ↓
2. Form appears inline
   ↓
3. Select new status + priority
   ↓
4. Add remarks (optional)
   ↓
5. Enter name in "Updated By"
   ↓
6. Click "Save Changes"
   ↓
7. Backend updates case + adds history entry
   ↓
8. Emit WebSocket notification
   ↓
9. Reload complaint data
   ↓
10. Show success message
```

### Viewing Evidence

```
1. Scroll to Evidence section
   ↓
2. Click on any image
   ↓
3. Fullscreen modal opens
   ↓
4. View full-size image
   ↓
5. Click X or outside to close
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

**1. Navigation**
- [ ] Click case ID in complaints table → Opens detail page
- [ ] Click "View" button → Opens detail page
- [ ] Click back arrow → Returns to complaints list

**2. Data Display**
- [ ] Case information displays correctly
- [ ] User information populates
- [ ] Status badge shows correct color
- [ ] Priority badge displays
- [ ] Created/updated dates format correctly
- [ ] Address displays all fields

**3. Status Update**
- [ ] Click "Update Status" → Form appears
- [ ] All status options available
- [ ] All priority options available
- [ ] Can add remarks
- [ ] Can save changes
- [ ] Cancel button works
- [ ] Success message appears
- [ ] Status history updates

**4. Status History**
- [ ] Displays all previous status changes
- [ ] Shows remarks for each change
- [ ] Shows who updated (updatedBy)
- [ ] Displays timestamps
- [ ] Timeline numbered correctly

**5. Evidence Viewer**
- [ ] Images display in grid
- [ ] Click image → Opens fullscreen
- [ ] Close button works
- [ ] Click outside closes modal
- [ ] Multiple images work

**6. Responsive Design**
- [ ] Desktop layout (3 columns)
- [ ] Tablet layout (stacked)
- [ ] Mobile layout (single column)
- [ ] All buttons accessible
- [ ] No horizontal scroll

**7. Error Handling**
- [ ] Invalid case ID → Shows error
- [ ] Network error → Shows message
- [ ] Loading state displays
- [ ] Empty data handled gracefully

---

## 📊 Database Schema Updates

### Before
```javascript
{
  status: "pending" | "solved"
}
```

### After
```javascript
{
  status: "pending" | "solved" | "under_review" | "investigating" | "rejected",
  priority: "low" | "medium" | "high" | "urgent",
  remarks: "Latest admin remarks",
  statusHistory: [
    {
      status: "under_review",
      remarks: "Documents verified",
      updatedBy: "Officer Kumar",
      updatedAt: "2025-11-07T..."
    }
  ],
  assignedTo: {
    officerId: "OFF123",
    officerName: "Kumar",
    assignedAt: "2025-11-07T..."
  }
}
```

---

## 🚀 Usage Examples

### Example 1: Update Status to Investigating

```typescript
// API Call
await updateComplaintStatus('67890abcdef', {
  status: 'investigating',
  priority: 'high',
  remarks: 'Contacted bank for transaction details. Awaiting response.',
  updatedBy: 'Inspector Rao'
})
```

**Result:**
- Status changes to "Investigating"
- Priority set to "High"
- Remarks added to case
- History entry created
- Notification sent to all connected admins

### Example 2: View Complaint with Evidence

```bash
# Navigate to
/complaints/67890abcdef123456

# Page displays:
- Complaint details
- User profile (auto-fetched)
- Evidence gallery (photos array from caseDetailsId)
- Status history timeline
- Quick actions
```

---

## 🔧 Configuration

### Environment Variables
No new environment variables required. Uses existing:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Dependencies
Already installed:
- react-icons
- date-fns
- axios
- next

---

## 🐛 Known Limitations & Future Enhancements

### Current Limitations
1. Evidence upload not implemented (only viewing)
2. Quick action buttons are placeholders
3. Officer assignment not connected to real officers
4. No PDF/print functionality yet
5. No WhatsApp message sending from UI

### Planned Enhancements
1. **Evidence Upload**
   - Drag & drop interface
   - Multiple file support
   - PDF viewer for documents
   - Cloud storage integration

2. **Officer Management**
   - Officer list dropdown
   - Auto-assign based on district
   - Officer workload tracking
   - Assignment notifications

3. **Communication**
   - Send WhatsApp messages from detail page
   - Email integration
   - SMS notifications
   - Call logging

4. **Printing & Export**
   - Print case report (formatted)
   - Export as PDF with charts
   - Export evidence ZIP file

5. **Advanced Features**
   - Case timeline visualization
   - Related cases linking
   - Duplicate detection
   - AI-suggested actions

---

## 📖 API Documentation

### Get Complaint Detail
```http
GET /api/whatsapp/case/:caseId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "complaint": {
      "_id": "67890...",
      "caseId": "CASE-2025-001",
      "status": "under_review",
      "priority": "high",
      "remarks": "Documents verified",
      "statusHistory": [...],
      "caseDetailsId": {
        "photos": [...]
      },
      ...
    },
    "user": {
      "name": "John Doe",
      "phoneNumber": "9876543210",
      ...
    }
  }
}
```

### Update Complaint Status
```http
PATCH /api/whatsapp/cases/:caseId
Content-Type: application/json

{
  "status": "investigating",
  "priority": "high",
  "remarks": "Contacted bank",
  "updatedBy": "Officer Kumar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67890...",
    "status": "investigating",
    "statusHistory": [
      {
        "status": "investigating",
        "remarks": "Contacted bank",
        "updatedBy": "Officer Kumar",
        "updatedAt": "2025-11-07T..."
      }
    ],
    ...
  },
  "message": "Case status updated successfully"
}
```

---

## 🎉 Summary

### What You Can Do Now

✅ **View Full Complaint Details**
- All complaint information in one place
- User profile with complete address
- Evidence/photos gallery
- Status history timeline

✅ **Update Status with Remarks**
- 5 status options
- 4 priority levels
- Add detailed remarks
- Track who made changes

✅ **Track History**
- See all status changes
- View remarks for each change
- Timestamp for every update
- User attribution

✅ **View Evidence**
- Image gallery
- Fullscreen viewer
- Multiple file support
- Clean UI

✅ **Navigate Seamlessly**
- Click case ID from table
- Back button to list
- Responsive design
- Fast loading

---

## 📞 Support

For issues or questions:
1. Check console logs (browser & server)
2. Verify API endpoints are running
3. Check database schema updates
4. Review notification system logs

---

**Version:** 1.0.0  
**Date:** November 7, 2025  
**Status:** ✅ Complete & Ready to Use
