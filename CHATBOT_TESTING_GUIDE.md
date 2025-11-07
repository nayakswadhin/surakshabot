# 🧪 SurakshaBot Chatbot - Testing Guide

## 🚀 Server Status
✅ **Backend**: Running on http://localhost:3000  
✅ **Frontend**: Running on http://localhost:3001  
✅ **MongoDB**: Connected

---

## 📍 How to Access the Chatbot

1. Open your browser and go to: **http://localhost:3001**
2. Look at the **bottom-right corner** of the screen
3. Click the **blue circular button** with the chat icon
4. The chatbot window will open with a welcome message

---

## 🎯 Test Queries - Copy & Paste These!

### 📊 **Statistics Queries**

#### 1. Total Complaints
```
How many total complaints?
```
**Expected**: Shows total count with breakdown by status

```
Total complaints
```
**Expected**: Same as above

```
Show me all complaints
```
**Expected**: Total statistics with navigation links

---

#### 2. Solved Cases
```
How many solved cases?
```
**Expected**: Number of solved cases with percentage

```
Show me solved complaints
```
**Expected**: Solved count with link to view them

```
Resolved cases
```
**Expected**: Same information about solved cases

---

#### 3. Pending Cases
```
How many pending complaints?
```
**Expected**: Pending count + long pending alert

```
Show pending cases
```
**Expected**: Pending statistics with navigation buttons

```
Which complaints are pending?
```
**Expected**: Pending breakdown with links

---

#### 4. Long Pending Cases (IMPORTANT!)
```
Which cases are pending for long time?
```
**Expected**: List of cases pending > 30 days with case IDs

```
Show me long pending cases
```
**Expected**: Oldest 5 cases with days count

```
Long pending complaints
```
**Expected**: Alert about cases needing urgent attention

---

### 🚨 **Priority Queries**

#### 5. Urgent Cases
```
Show urgent cases
```
**Expected**: Count of urgent and high priority cases

```
Critical complaints
```
**Expected**: Priority breakdown with navigation

```
High priority cases
```
**Expected**: Urgent + High priority statistics

---

### 📅 **Time-Based Queries**

#### 6. Today's Complaints
```
How many complaints today?
```
**Expected**: Count of cases registered today

```
Today's cases
```
**Expected**: Same with navigation link

```
Show me today's complaints
```
**Expected**: Today's statistics

---

#### 7. This Week's Cases
```
This week's complaints
```
**Expected**: Count from last 7 days

```
How many cases this week?
```
**Expected**: Weekly statistics

```
Weekly complaints
```
**Expected**: Same data

---

#### 8. This Month's Cases
```
This month's complaints
```
**Expected**: Count for current month

```
How many complaints this month?
```
**Expected**: Monthly statistics

```
Monthly cases
```
**Expected**: Same information

---

### 🔍 **Status-Based Queries**

#### 9. Under Review
```
Show cases under review
```
**Expected**: Count of cases being reviewed

```
Under review complaints
```
**Expected**: Cases in review status

---

#### 10. Investigating
```
Show investigating cases
```
**Expected**: Count of cases under investigation

```
Which cases are being investigated?
```
**Expected**: Investigation status count

---

### 💰 **Fraud Type Queries**

#### 11. Fraud Types
```
Show fraud types
```
**Expected**: Top 10 fraud types with counts

```
What are the most common frauds?
```
**Expected**: Fraud type breakdown

```
Fraud categories
```
**Expected**: Category statistics (Financial vs Social)

---

#### 12. Financial Fraud
```
Show financial frauds
```
**Expected**: Financial category count + top types

```
Financial fraud cases
```
**Expected**: Financial category breakdown

---

#### 13. Social Media Fraud
```
Social media fraud
```
**Expected**: Social category statistics

```
Show social media cases
```
**Expected**: Social fraud breakdown

---

### 📈 **Analytics & Reports**

#### 14. Analytics
```
Show analytics
```
**Expected**: Link to analytics dashboard

```
View analytics
```
**Expected**: Analytics description + navigation

```
Show me reports
```
**Expected**: Reports page link

---

### 🔧 **Status Check**

#### 15. Check Status
```
How can I check my complaint status?
```
**Expected**: Instructions + link to complaints page

```
Track my complaint
```
**Expected**: Guidance on status checking

```
Check complaint status
```
**Expected**: Navigation to complaints section

---

### 👥 **Users Query**

#### 16. Registered Users
```
How many users?
```
**Expected**: Total registered users count

```
Total citizens
```
**Expected**: User statistics

```
Show registered people
```
**Expected**: User count with link

---

### ❓ **Help & General**

#### 17. Help
```
help
```
**Expected**: List of all available query types

```
What can you do?
```
**Expected**: Comprehensive feature list

```
How can you assist me?
```
**Expected**: Help menu with suggestions

---

#### 18. Random Query (Fallback)
```
Hello
```
**Expected**: Welcome message with quick stats + suggestions

```
Hi
```
**Expected**: Greeting with available options

```
xyz random text
```
**Expected**: Default response with suggestions

---

## 🎨 Visual Features to Check

### ✅ When Testing, Look For:

1. **Welcome Message**
   - Should show current statistics automatically
   - Navigation links at the bottom

2. **Quick Action Buttons**
   - 8 pre-defined buttons on first load
   - Clickable to auto-fill queries

3. **Message Bubbles**
   - User messages: Blue on right
   - Bot messages: White on left
   - Timestamps on each message

4. **Navigation Links**
   - Appear below bot messages
   - Format: `[Text →]` with external link icon
   - Clicking should navigate and close chatbot

5. **Typing Indicator**
   - Animated dots while bot is thinking
   - Shows before each response

6. **Smooth Animations**
   - Chat window slides in from bottom
   - Messages appear smoothly
   - Scroll auto-adjusts to latest message

---

## 🧪 Advanced Testing Scenarios

### Scenario 1: Full Workflow Test
1. Open chatbot
2. Click "Long Pending" quick action
3. Read the response
4. Click "View All Long Pending" link
5. Verify you're redirected to complaints page
6. Notice chatbot closed automatically

### Scenario 2: Natural Language Test
Try variations of the same query:
- "How many complaints?"
- "Total number of cases"
- "Show all complaints"
All should give similar responses!

### Scenario 3: Multiple Queries
1. Ask: "Total complaints"
2. Then ask: "Show pending"
3. Then ask: "Fraud types"
4. Verify each response is different and accurate

### Scenario 4: Navigation Test
1. Ask any query that includes links
2. Click each navigation link
3. Verify correct page opens
4. Check chatbot closes after click

---

## 🐛 Troubleshooting

### Issue: Chatbot doesn't open
- **Check**: Is the frontend running on port 3001?
- **Check**: Are you on the login page? (Chatbot is hidden there)
- **Fix**: Refresh the page

### Issue: No response from bot
- **Check**: Backend running on port 3000?
- **Check**: MongoDB connected? (Look at backend terminal)
- **Check**: Browser console for errors (F12)

### Issue: "Failed to fetch" error
- **Check**: Both servers are running
- **Check**: No firewall blocking localhost:3000
- **Fix**: Restart backend server

### Issue: Navigation links don't work
- **Check**: Next.js router is working
- **Check**: Frontend compiled successfully
- **Fix**: Hard refresh (Ctrl+Shift+R)

---

## 📊 Expected Data (Based on Your Database)

The chatbot pulls **real-time data** from MongoDB. Your responses will show actual counts from your `Cases` collection.

### Sample Response Format:

**Query**: "How many pending complaints?"

**Bot Response**:
```
⏳ Pending Complaints: 45

⚠️ Long Pending (>30 days): 12

These cases require immediate attention!

[View Pending Cases →] [View Long Pending →]
```

---

## 🎯 Success Criteria

✅ Chatbot appears in bottom-right corner  
✅ Welcome message shows with real statistics  
✅ All query types return relevant responses  
✅ Navigation links work and redirect properly  
✅ Chatbot closes after clicking links  
✅ Typing indicator shows during processing  
✅ Messages scroll automatically  
✅ UI is responsive and smooth  

---

## 📝 Quick Test Checklist

Copy this list and test each:

- [ ] "Total complaints" - Shows breakdown
- [ ] "Pending cases" - Shows pending + long pending
- [ ] "Long pending cases" - Lists oldest cases
- [ ] "Urgent cases" - Shows priority breakdown
- [ ] "Today's complaints" - Shows today's count
- [ ] "Fraud types" - Lists top fraud types
- [ ] "Show analytics" - Provides navigation link
- [ ] "Help" - Shows available queries
- [ ] Click any navigation link - Redirects correctly
- [ ] Click quick action button - Auto-fills and sends

---

## 🚀 Pro Tips

1. **Type naturally**: The bot understands variations
2. **Use quick actions**: Fastest way to test features
3. **Check navigation**: Every response has useful links
4. **Test edge cases**: Try typos, the bot handles them gracefully
5. **Watch the backend**: Terminal shows API calls in real-time

---

## 📞 Next Steps After Testing

Once you verify everything works:
1. Test with real complaint data from your database
2. Customize responses in `/routes/chatbot.js`
3. Add more query patterns as needed
4. Consider adding voice input
5. Implement user authentication for personalized queries

---

**Ready to test? Open http://localhost:3001 and start chatting!** 🤖💬
