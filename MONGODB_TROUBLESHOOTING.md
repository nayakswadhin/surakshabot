# MongoDB Connection Troubleshooting Guide

## Current Connection String

```
mongodb+srv://nayakswadhin25_db_user:12345@cluster0.evjfami.mongodb.net/test?retryWrites=true&w=majority
```

## Common Issues & Solutions

### Issue 1: Cluster is Paused

**Solution:**

1. Go to https://cloud.mongodb.com
2. Click on "Database" in left menu
3. If cluster shows "Paused", click "Resume"
4. Wait 1-2 minutes for cluster to start

### Issue 2: Wrong Password

**Solution:**

1. Go to https://cloud.mongodb.com
2. Click "Database Access" under Security
3. Find user: nayakswadhin25_db_user
4. Click "Edit" → "Edit Password"
5. Set password to: 12345
6. Click "Update User"

### Issue 3: Wrong Username

**Solution:**

1. Go to https://cloud.mongodb.com
2. Click "Database Access" under Security
3. Verify username matches: nayakswadhin25_db_user
4. If different, update .env file with correct username

### Issue 4: Get Fresh Connection String

**Solution:**

1. Go to https://cloud.mongodb.com
2. Click "Database" → "Connect" button (on Cluster0)
3. Choose "Connect your application"
4. Select: Driver: Node.js, Version: 4.1 or later
5. Copy the connection string
6. Replace <password> with 12345
7. Replace <database> with test
8. Update .env file

### Example Fresh Connection String Format:

```
mongodb+srv://USERNAME:PASSWORD@cluster0.evjfami.mongodb.net/DATABASE?retryWrites=true&w=majority
```

Replace:

- USERNAME with your MongoDB user
- PASSWORD with 12345
- DATABASE with test

## Quick Fix: Create New User

If nothing works, create a new user:

1. Go to MongoDB Atlas → Database Access
2. Click "+ ADD NEW DATABASE USER"
3. Authentication Method: Password
4. Username: surakshabot_user
5. Password: Suraksha@2025
6. Database User Privileges: Read and write to any database
7. Click "Add User"

Then update .env:

```
MONGODB_URI=mongodb+srv://surakshabot_user:Suraksha@2025@cluster0.evjfami.mongodb.net/test?retryWrites=true&w=majority
```

## Test Connection

Run this command to test:

```bash
node test-mongo-connection.js
```

## Need More Help?

Check MongoDB Atlas status:

- Your IP in Network Access: 0.0.0.0/0 ✓
- Cluster Status: Should be "Active"
- User exists: Check Database Access
- Password correct: Verify in Database Access
