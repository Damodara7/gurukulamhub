# SMS OTP Flow Documentation

## How OTP is Sent to Phone

### Flow Overview

1. **User Action** → Frontend calls API endpoint (e.g., `/api/phone`)
2. **API Route** → `src/app/api/phone/route.ts` receives request
3. **Service Call** → Calls `UserService.srvSendPhoneOtp(email, phone, name)`
4. **OTP Generation** → `OtpService.generateOTP()` creates 6-digit OTP
5. **Database Update** → OTP stored in user record with expiry time
6. **SMS Template** → `SMSService.getOTPTemplate()` creates JSON payload
7. **SMS Service** → `SMSService.srvSendSMS()` sends to MSG91 API
8. **Response** → Returns success/failure status with testing OTP

### Code Flow

```
Frontend (Login.jsx, 02PhoneDetailsStep.jsx, etc.)
  ↓
POST /api/phone
  ↓
src/app/api/phone/route.ts
  ↓
UserService.srvSendPhoneOtp() [src/app/services/user.service.js:1079-1155]
  ├─ Generate OTP: OtpService.generateOTP()
  ├─ Update DB: updateOne() with verifyToken
  └─ Send SMS: SMSService.srvSendSMS()
      ↓
SMSService.srvSendSMS() [src/app/services/sms.service.ts:33-118]
  ├─ Create HTTP request to MSG91 API
  ├─ Use API key: '402357AbaNrR2hbJGo6606c420P1'
  ├─ Use template ID: '6635e066d6fc056946450622'
  └─ Send to: https://control.msg91.com/api/v5/flow/
```

## SMS Service API Keys & Configuration

### Current Implementation (Hardcoded - ⚠️ Security Issue)

**File**: `src/app/services/sms.service.ts`

**API Key**: `402357AbaNrR2hbJGo6606c420P1` (Line 9)
- **Service**: MSG91
- **API Endpoint**: `https://control.msg91.com/api/v5/flow/`
- **Template ID**: `6635e066d6fc056946450622` (Line 19)

### MSG91 API Details

- **Service Provider**: MSG91 (https://msg91.com)
- **API Type**: Flow API (v5)
- **Authentication**: Header-based (`authkey`)
- **Request Format**: JSON
- **Response Format**: JSON

### Request Payload Structure

```json
{
  "template_id": "6635e066d6fc056946450622",
  "short_url": "0",
  "recipients": [
    {
      "mobiles": "918247783396",
      "nameVal": "User Name",
      "otpVal": "833029"
    }
  ]
}
```

### Response Structure

**Success**:
```json
{
  "message": "3661756f7a376d764b395261",
  "type": "success"
}
```

**Error**:
```json
{
  "type": "error",
  "message": "Error message here"
}
```

## Security Recommendation

⚠️ **The API key is currently hardcoded in the source code. This is a security risk!**

### Recommended Fix: Move to Environment Variables

1. Add to `.env` files:
   ```
   MSG91_API_KEY=402357AbaNrR2hbJGo6606c420P1
   MSG91_TEMPLATE_ID=6635e066d6fc056946450622
   ```

2. Update `sms.service.ts` to use environment variables ✅ **DONE**
3. Add to Kubernetes Secrets for production

## Important: Invalid API Key Detection

⚠️ **MSG91 may return `{"type":"success"}` even with invalid API keys!**

The code now includes strict validation to detect this:

1. **API Key Format Validation**: Checks if API key matches expected format
2. **Error Code Detection**: Checks for MSG91 error codes (201, 207, 401, 403)
3. **Response Format Validation**: Validates response message format
4. **Force Testing Mode**: Set `FORCE_SMS_TESTING_MODE=true` to always show testing OTP

### Force Testing Mode (for development/testing)

If your SMS service is not configured or API keys are invalid, add to `.env`:
```
FORCE_SMS_TESTING_MODE=true
```

This will:
- Always treat SMS as failed
- Always show testing OTP in UI
- Useful when SMS service is not properly configured

