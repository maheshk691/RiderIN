# Fake OTP Testing Guide for RiderIN

This guide explains how to use the fake OTP feature for testing your RiderIN application.

## Overview

When `FAKE_OTP_ENABLED=true` in your `.env` file, the system will use a consistent fake OTP value instead of random OTPs, making testing easier and more predictable.

## Setup

### 1. Enable Fake OTP Mode

In your server `.env` file, set these variables:

```env
# Fake OTP for Testing
FAKE_OTP_ENABLED=true
FAKE_OTP_VALUE=1234
```

### 2. Start the Server

```bash
cd server
npm run start:dev
```

## How It Works

### Backend Features

1. **Consistent OTP Generation**: All OTPs will be generated as `1234` (or your configured value)
2. **Console Logging**: Clear indicators when fake mode is active
3. **Test Endpoint**: Get the current fake OTP value via API

### API Endpoints

#### Get Fake OTP for Testing
```
GET /api/v1/otp/test/fake-otp
```

**Response:**
```json
{
  "success": true,
  "message": "Fake OTP retrieved successfully",
  "fake_otp": "1234",
  "note": "Use this OTP to test your application"
}
```

#### Fake Register User (Skip OTP Verification)
```
POST /api/v1/otp/test/register-user
```

**Request Body:**
```json
{
  "phone_number": "+919999999999"
}
```

**Response for new user:**
```json
{
  "success": true,
  "message": "Fake user registered successfully!",
  "user": { ...user object with phone_number only... }
}
```

**Response for existing user:**
```json
{
  "success": true,
  "token": "jwt_token_here"
  // Other auth response fields
}
```

#### Fake Register Driver (Skip OTP Verification)
```
POST /api/v1/otp/test/register-driver
```

**Request Body:**
```json
{
  "phone_number": "+919999999999"
}
```

**Response for new driver:**
```json
{
  "success": true,
  "message": "Fake driver registered successfully!",
  "driver": { ...driver object with phone_number only... }
}
```

**Response for existing driver:**
```json
{
  "success": true,
  "token": "jwt_token_here"
  // Other auth response fields
}
```

#### Regular OTP Endpoints
When fake mode is enabled, these endpoints will also use the fake OTP:
- `POST /api/v1/otp/generate/phone` - Generate phone OTP
- `POST /api/v1/otp/generate/email` - Generate email OTP

## Console Logging

### When Fake OTP is Generated:
```
🚀 FAKE OTP MODE: Using fake OTP value for testing
```

### When Fake SMS is Sent:
```
📱 FAKE MODE: OTP 1234 sent to +919999999999 (THIS IS FOR TESTING)
💡 FAKE OTP VALUE: 1234 - Use this in the app to login/verify
```

### When Fake Email is Sent:
```
📧 FAKE MODE: OTP 1234 sent to user@example.com (THIS IS FOR TESTING)
💡 FAKE OTP VALUE: 1234 - Use this to verify email
```

## Testing Steps

### 1. Enable Fake Mode
Set `FAKE_OTP_ENABLED=true` and `FAKE_OTP_VALUE=1234` in your server `.env`

### 2. Start Server
```bash
cd server
npm run start:dev
```

### 3. Test Frontend Flow

#### Driver Login:
1. Open your driver app
2. Enter any phone number (e.g., `+919999999999`)
3. Request OTP
4. Enter `1234` when prompted
5. Verification should succeed

#### User/Driver Registration:
1. Go through the registration flow
2. Enter `1234` for OTP verification, or use fake registration endpoints to skip OTP entirely
3. For even faster testing, directly call POST `/api/v1/otp/test/register-user` or `/api/v1/otp/test/register-driver` with phone_number
4. All steps should work seamlessly

#### Email Verification:
1. During driver registration, enter any email
2. Check the server console for the fake OTP value
3. Enter `1234` (or your configured value) to verify

### 4. Verify with Test Endpoint

You can also verify the fake OTP value by calling:
```bash
curl http://localhost:3000/api/v1/otp/test/fake-otp
```

## Production Notes

### Disabling Fake Mode
Set `FAKE_OTP_ENABLED=false` or remove the variable entirely:

```env
# Comment out or remove these lines for production
# FAKE_OTP_ENABLED=true
# FAKE_OTP_VALUE=1234
```

### Security Considerations
- **NEVER enable fake OTP in production environments**
- The fake OTP values will be logged to your console, which is helpful for development but should not be exposed in production
- Redis will still store the OTPs, so verification logic remains unchanged

## Features

✅ Consistent fake OTP for all operations (SMS, Email)
✅ Clear console logging for developers
✅ Separate test endpoint to get current fake OTP
✅ Backward compatible with existing OTP functions
✅ Can be easily toggled via environment variables

## Troubleshooting

### OTP Still Not Working
1. Check that `FAKE_OTP_ENABLED=true` in your `.env`
2. Restart the server after changing environment variables
3. Look for the rocket emoji (🚀) in server console logs

### Test Endpoint Not Working
1. Ensure the server is running on the correct port (default: 3000)
2. Check that the fake OTP mode is enabled
3. Verify the endpoint URL: `/api/v1/otp/test/fake-otp`

## Example Usage

```javascript
// Request OTP
fetch('/api/v1/driver/send-otp', {
  method: 'POST',
  body: JSON.stringify({ phone_number: '+919999999999' })
})
.then(() => {
  // Server console will show:
  // 🔔 FAKE MODE: OTP 1234 sent to +919999999999
  console.log('OTP requested');
});

// Verify OTP with fake value
fetch('/api/v1/driver/login', {
  method: 'POST',
  body: JSON.stringify({ phone_number: '+919999999999', otp: '1234' })
})
.then(() => {
  console.log('Login successful with fake OTP!');
});
