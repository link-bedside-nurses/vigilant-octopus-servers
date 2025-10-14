# Admin Onboarding Guide

## Overview

This guide explains the secure admin onboarding flow implemented in the LinkBedside Nurses system. The system supports two types of administrators:

1. **Super Admin** - Only ONE allowed in the system. Has full control and can activate/deactivate other admins.
2. **Regular Admin** - Can be registered by anyone, but requires password setup and super admin activation before they can sign in.

## Security Features

- ✅ Only one super admin allowed in the system
- ✅ Regular admins cannot register as super admins
- ✅ Password setup via secure email token (expires in 5 minutes)
- ✅ Email verification required
- ✅ Super admin activation required before signin
- ✅ Secure password reset flow with OTP
- ✅ Redis-based token management
- ✅ Comprehensive email notifications

## Admin Onboarding Flow

### For Regular Admins

```
1. Registration
   ↓
2. Receive password setup email (5 min expiry)
   ↓
3. Set password using email link
   ↓
4. Wait for super admin activation
   ↓
5. Receive activation notification email
   ↓
6. Sign in with credentials
```

## API Endpoints

### 1. Admin Registration

**Endpoint:** `POST /api/v1/auth/admin/signup`

**Description:** Register a new admin account (not super admin).

**Request Body:**
```json
{
  "email": "admin@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (Success - 201):**
```json
{
  "statusCode": 201,
  "body": {
    "data": {
      "user": {
        "id": "64abc123...",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "isActive": false,
        "isPasswordSet": false
      },
      "expiresAt": "2024-01-01T12:05:00.000Z"
    },
    "message": "Admin account created. Please check your email to set up your password."
  }
}
```

**What Happens:**
- Admin account created with `isActive: false`, `isPasswordSet: false`
- Password setup token generated (5 min expiry) and stored in Redis
- Email sent with password setup link
- Token format: `https://your-domain.com/admin/set-password?token=<64-char-hex>`

**Errors:**
- `400` - Email already in use
- `500` - Failed to send setup email (account rolled back)

---

### 2. Set Password

**Endpoint:** `POST /api/v1/auth/admin/set-password`

**Description:** Set password using token from email.

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "user": {
        "id": "64abc123...",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "isActive": false,
        "isPasswordSet": true
      }
    },
    "message": "Password set successfully. Please wait for super admin to activate your account."
  }
}
```

**What Happens:**
- Token verified from Redis
- Password hashed and saved
- `isPasswordSet: true`, `isEmailVerified: true`
- Token invalidated after use
- Admin still needs super admin activation

**Errors:**
- `400` - Invalid/expired token, passwords don't match, or password already set
- `404` - Admin account not found

---

### 3. Resend Password Setup Link

**Endpoint:** `POST /api/v1/auth/admin/resend-setup-link`

**Description:** Resend password setup email if the original link expired.

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "expiresAt": "2024-01-01T12:05:00.000Z"
    },
    "message": "Password setup link sent to your email"
  }
}
```

**Errors:**
- `400` - Email required or password already set
- `404` - Admin account not found

---

### 4. Admin Signin

**Endpoint:** `POST /api/v1/auth/admin/signin`

**Description:** Sign in with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "user": {
        "id": "64abc123...",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "isActive": true,
        "isSuperAdmin": false,
        "isEmailVerified": true
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "Signed in successfully"
  }
}
```

**What Happens:**
- Credentials validated
- Password set check performed
- Email verification check performed
- Account activation check performed (non-super admins only)
- JWT token generated

**Errors:**
- `401` - Invalid credentials or email not verified
- `403` - Account pending activation by super administrator

---

### 5. Forgot Password

**Endpoint:** `POST /api/v1/auth/admin/forgot-password`

**Description:** Request password reset OTP.

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "expiresAt": "2024-01-01T12:05:00.000Z"
    },
    "message": "Password reset OTP sent to your email"
  }
}
```

**What Happens:**
- 5-digit OTP generated and stored in Redis (5 min expiry)
- OTP email sent

---

### 6. Reset Password

**Endpoint:** `POST /api/v1/auth/admin/reset-password`

**Description:** Reset password with OTP.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "otp": "12345",
  "newPassword": "NewSecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "user": {
        "id": "64abc123...",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "message": "Password reset successful. You can now sign in."
  }
}
```

---

## Super Admin Endpoints

All super admin endpoints require authentication and super admin role.

### 7. Get Pending Admins

**Endpoint:** `GET /api/v1/auth/admin/pending`

**Headers:** `Authorization: Bearer <token>`

**Description:** Get all admins awaiting activation.

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": [
      {
        "id": "64abc123...",
        "email": "admin@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "isActive": false,
        "isPasswordSet": true,
        "isEmailVerified": true,
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "message": "Pending admins retrieved successfully"
  }
}
```

**Criteria:**
- `isPasswordSet: true`
- `isActive: false`
- `isSuperAdmin: false`

---

### 8. Activate Admin

**Endpoint:** `POST /api/v1/auth/admin/:id/activate`

**Headers:** `Authorization: Bearer <token>`

**Description:** Activate a pending admin account.

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "id": "64abc123...",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true
    },
    "message": "Admin account activated successfully"
  }
}
```

**What Happens:**
- Admin's `isActive` set to `true`
- Activation email sent to admin
- Admin can now sign in

**Errors:**
- `400` - Admin already active, password not set, or trying to modify super admin
- `403` - Super admin access required
- `404` - Admin not found

---

### 9. Deactivate Admin

**Endpoint:** `POST /api/v1/auth/admin/:id/deactivate`

**Headers:** `Authorization: Bearer <token>`

**Description:** Deactivate an active admin account.

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "id": "64abc123...",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": false
    },
    "message": "Admin account deactivated successfully"
  }
}
```

**Errors:**
- `400` - Admin already deactivated or trying to deactivate super admin
- `403` - Super admin access required
- `404` - Admin not found

---

### 10. Delete Admin

**Endpoint:** `DELETE /api/v1/auth/admin/:id`

**Headers:** `Authorization: Bearer <token>`

**Description:** Permanently delete an admin account.

**Response (Success - 200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "id": "64abc123...",
      "email": "admin@example.com"
    },
    "message": "Admin account deleted successfully"
  }
}
```

**Errors:**
- `400` - Trying to delete super admin or yourself
- `403` - Super admin access required
- `404` - Admin not found

---

## Database Schema

### Admin Model

```typescript
{
  email: string (required, unique)
  password?: string (optional until set)
  firstName?: string
  lastName?: string
  isEmailVerified: boolean (default: false)
  isActive: boolean (default: false)
  isSuperAdmin: boolean (default: false)
  isPasswordSet: boolean (default: false)
  createdAt: Date
  updatedAt: Date
}
```

### Redis Keys

**Password Setup Tokens:**
- Key: `admin:password-setup:<token>`
- Value: `<email>`
- TTL: 300 seconds (5 minutes)

**OTP for Password Reset:**
- Key: `otp:<email>`
- Value: `<5-digit-otp>`
- TTL: 300 seconds (5 minutes)

---

## Email Templates

### 1. Password Setup Email

**Subject:** Set Up Your Admin Account Password

**Content:**
- Welcome message
- Password setup link with token
- Expiry warning (5 minutes)
- Instructions about activation requirement

### 2. Account Activation Email

**Subject:** Your Admin Account Has Been Activated

**Content:**
- Congratulations message
- Sign-in link
- Credentials reminder
- Welcome message

### 3. Password Reset OTP Email

**Subject:** Email Verification Code

**Content:**
- 5-digit OTP
- Expiry information (5 minutes)
- Security warning

---

## Testing Credentials

After running the seed script:

**Super Admin:**
- Email: `superadmin@linkbedside.com`
- Password: `SuperAdmin@123`
- Status: Active, can sign in immediately

**Regular Admins:**
- Created with varying states (some with passwords, some pending)
- Use for testing activation flow

---

## Implementation Details

### Services Used

1. **AdminTokenService** (`src/services/admin-token.service.ts`)
   - Manages password setup tokens
   - Redis-based token storage
   - Token generation, verification, and invalidation

2. **MessagingService** (`src/services/messaging.ts`)
   - `sendPasswordSetupEmail()` - Setup link with token
   - `sendAccountActivationEmail()` - Activation notification
   - `sendOTPViaEmail()` - OTP for password reset

3. **Password Utility** (`src/utils/password.ts`)
   - Password hashing with argon2
   - Password verification

### Security Measures

1. **Token Security:**
   - 64-character hex tokens (32 bytes of randomness)
   - 5-minute expiry
   - One-time use (invalidated after use)
   - Stored in Redis for fast access and automatic expiry

2. **Password Requirements:**
   - Minimum 8 characters
   - Must match confirmation
   - Hashed with argon2

3. **Super Admin Protection:**
   - Cannot create additional super admins via API
   - Cannot modify/delete super admin
   - Super admin always active

4. **Rate Limiting:**
   - OTP requests limited (inherited from messaging service)
   - Max 5 OTP requests per 60 seconds per email

---

## Frontend Integration

### Registration Flow

```typescript
// Step 1: Register
const response = await fetch('/api/v1/auth/admin/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// Step 2: Admin receives email and clicks link
// Link contains token: /admin/set-password?token=abc123...

// Step 3: Set password
const token = new URLSearchParams(window.location.search).get('token');
const setPasswordResponse = await fetch('/api/v1/auth/admin/set-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token,
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!'
  })
});

// Step 4: Wait for activation (show waiting screen)
```

### Super Admin Dashboard

```typescript
// Get pending admins
const pendingResponse = await fetch('/api/v1/auth/admin/pending', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const pendingAdmins = await pendingResponse.json();

// Activate admin
const activateResponse = await fetch(`/api/v1/auth/admin/${adminId}/activate`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Error Handling

### Common Errors

| Error Code | Message | Solution |
|------------|---------|----------|
| 400 | Email already in use | Use different email or sign in |
| 400 | Invalid or expired token | Request new setup link |
| 400 | Passwords don't match | Ensure passwords match |
| 401 | Invalid credentials | Check email/password |
| 403 | Account pending activation | Wait for super admin activation |
| 403 | Super admin access required | Only super admin can perform action |
| 404 | Admin account not found | Check email or re-register |

---

## Troubleshooting

### Admin can't receive password setup email

1. Check spam/junk folder
2. Verify email configuration in `.env`
3. Use resend setup link endpoint
4. Check Redis connection
5. Review server logs

### Token expired before password setup

1. Use resend setup link endpoint
2. Complete setup within 5 minutes
3. Check server time synchronization

### Admin activated but can't sign in

1. Verify password was set correctly
2. Check `isPasswordSet: true` in database
3. Verify `isActive: true` for regular admins
4. Check for typos in credentials

### Super admin locked out

1. Access database directly
2. Reset super admin password hash
3. Ensure `isActive: true` and `isSuperAdmin: true`

---

## Best Practices

1. **Super Admin Account:**
   - Keep credentials secure
   - Use strong password
   - Change default password immediately
   - Don't share super admin access

2. **Regular Admin Management:**
   - Review pending admins promptly
   - Verify admin identity before activation
   - Deactivate unused accounts
   - Remove admins who leave organization

3. **Security:**
   - Monitor failed login attempts
   - Regularly audit admin accounts
   - Keep email service credentials secure
   - Ensure Redis is properly secured

4. **Operations:**
   - Document admin changes
   - Maintain audit logs
   - Test onboarding flow regularly
   - Keep backup of super admin credentials

---

## Monitoring

### Key Metrics

- Pending admin count
- Average time to activation
- Failed password setup attempts
- Failed signin attempts
- Active admin count

### Logs to Monitor

```
Password setup token created for <email>
Password set successfully for <email>
Admin activated: <email>
Failed signin attempt for <email>
Super admin action: <action> on <target-email>
```

---

## Migration from Old System

If migrating from previous admin system:

1. Identify existing super admin
2. Update super admin record:
   ```javascript
   db.admins.updateOne(
     { email: 'superadmin@example.com' },
     { 
       $set: { 
         isSuperAdmin: true, 
         isPasswordSet: true,
         isActive: true,
         isEmailVerified: true
       }
     }
   );
   ```

3. Update other admins:
   ```javascript
   db.admins.updateMany(
     { email: { $ne: 'superadmin@example.com' } },
     { 
       $set: { 
         isSuperAdmin: false,
         isPasswordSet: true,
         // Review and set isActive appropriately
       }
     }
   );
   ```

---

## Support

For issues or questions:
1. Check this guide
2. Review server logs
3. Contact development team
4. Check GitHub issues

---

**Last Updated:** 2024
**Version:** 1.0.0