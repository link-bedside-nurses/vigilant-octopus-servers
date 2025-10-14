# Nurse Portal Guide

## Overview

This guide documents the complete Nurse Portal system for LinkBedside Nurses. The portal allows nurses to:

- Register with document verification
- Sign in using OTP-based phone authentication
- View and manage their profile
- View assigned appointments with patient details
- Initiate payments for appointments
- Track earnings and statistics

## Table of Contents

1. [Nurse Registration](#nurse-registration)
2. [Authentication](#authentication)
3. [Profile Management](#profile-management)
4. [Appointments](#appointments)
5. [Payments](#payments)
6. [Statistics](#statistics)
7. [Technical Details](#technical-details)
8. [Frontend Integration](#frontend-integration)

---

## Nurse Registration

### Registration Flow

```
1. Upload Documents (Profile, National ID, Qualifications)
   ↓
2. Registration submitted
   ↓
3. Account created with "pending" verification status
   ↓
4. Wait for admin verification
   ↓
5. Admin verifies documents and activates account
   ↓
6. Nurse can now sign in
```

### Endpoint: Register Nurse

**POST** `/api/v1/nurse-auth/register`

**Content-Type:** `multipart/form-data`

**Required Files:**
- `profilePicture` - Profile/passport photo (1 file, max 15MB)
- `nationalIdFront` - Front of National ID (1 file, max 15MB)
- `nationalIdBack` - Back of National ID (1 file, max 15MB)
- `qualifications` - Qualification documents (1-5 files, max 15MB each)

**Required Form Fields:**
- `firstName` - Nurse's first name (min 2 characters)
- `lastName` - Nurse's last name (min 2 characters)
- `phone` - Uganda phone number (format: +256XXXXXXXXX or 256XXXXXXXXX or 07XXXXXXXX)
- `email` - Email address (optional)
- `qualificationsMeta` - JSON array of qualification metadata

**qualificationsMeta Format:**
```json
[
  {
    "type": "certification",
    "title": "Registered Nurse License",
    "description": "Valid nursing license from Uganda Nurses and Midwives Council"
  },
  {
    "type": "cv",
    "title": "Curriculum Vitae",
    "description": "Professional CV with work experience"
  }
]
```

**Qualification Types:**
- `certification` - Professional certifications, licenses
- `cv` - Curriculum Vitae
- `other` - Other relevant documents

**Allowed File Types:**
- Images: JPG, JPEG, PNG
- Documents: PDF, DOC, DOCX

**Example Request (using JavaScript FormData):**

```javascript
const formData = new FormData();

// Basic information
formData.append('firstName', 'Jane');
formData.append('lastName', 'Doe');
formData.append('phone', '+256771234567');
formData.append('email', 'jane.doe@example.com');

// Profile picture
formData.append('profilePicture', profilePictureFile);

// National ID
formData.append('nationalIdFront', frontIdFile);
formData.append('nationalIdBack', backIdFile);

// Qualifications
formData.append('qualifications', certificationFile);
formData.append('qualifications', cvFile);

// Qualifications metadata
const qualificationsMeta = [
  {
    type: 'certification',
    title: 'Registered Nurse License',
    description: 'Valid nursing license'
  },
  {
    type: 'cv',
    title: 'Professional CV',
    description: 'My curriculum vitae'
  }
];
formData.append('qualificationsMeta', JSON.stringify(qualificationsMeta));

// Send request
const response = await fetch('/api/v1/nurse-auth/register', {
  method: 'POST',
  body: formData
});
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "body": {
    "data": {
      "nurse": {
        "id": "64abc123...",
        "firstName": "Jane",
        "lastName": "Doe",
        "phone": "+256771234567",
        "email": "jane.doe@example.com",
        "profilePicture": {
          "publicId": "unique-id.jpg",
          "url": "unique-id.jpg",
          "streamingUrl": "http://server.com/stream/image/unique-id.jpg",
          "mimeType": "image/jpeg",
          "size": 245678,
          "uploadedAt": "2024-01-01T12:00:00.000Z",
          "originalName": "profile.jpg"
        },
        "documentVerificationStatus": "pending",
        "isActive": false,
        "isVerified": false
      }
    },
    "message": "Nurse registration successful. Your documents are under review. Please wait for verification."
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Phone already exists | Nurse with this phone number already registered |
| 400 | Email already in use | Email is taken by another nurse |
| 400 | No files uploaded | Required documents missing |
| 400 | Profile picture required | Profile picture not uploaded |
| 400 | National ID required | National ID documents missing |
| 400 | Qualifications required | At least one qualification document required |
| 400 | Invalid qualificationsMeta | Metadata doesn't match uploaded files |
| 400 | File too large | File exceeds 15MB limit |
| 400 | File type not allowed | Invalid file format |

---

## Authentication

Nurse authentication uses OTP (One-Time Password) sent via SMS for secure, passwordless login.

### 1. Initiate Sign In

**POST** `/api/v1/nurse-auth/signin`

**Request Body:**
```json
{
  "phone": "+256771234567"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "message": "OTP sent to your phone number",
      "expiresAt": "2024-01-01T12:05:00.000Z",
      "nurse": {
        "id": "64abc123...",
        "firstName": "Jane",
        "lastName": "Doe",
        "phone": "+256771234567"
      }
    },
    "message": "Check your phone for OTP"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | Nurse not found | No account with this phone number |
| 403 | Account pending verification | Documents under review |
| 403 | Account deactivated | Account has been deactivated |
| 500 | Failed to send OTP | SMS service error |

---

### 2. Verify OTP and Sign In

**POST** `/api/v1/nurse-auth/verify-otp`

**Request Body:**
```json
{
  "phone": "+256771234567",
  "otp": "12345"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "nurse": {
        "id": "64abc123...",
        "firstName": "Jane",
        "lastName": "Doe",
        "phone": "+256771234567",
        "email": "jane.doe@example.com",
        "profilePicture": { /* full profile picture object */ },
        "isActive": true,
        "isVerified": true,
        "documentVerificationStatus": "verified"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "Signed in successfully"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid or expired OTP | Wrong OTP or expired (5 minutes) |
| 403 | Account pending verification | Account not yet verified |
| 403 | Account deactivated | Account has been deactivated |
| 404 | Nurse not found | Account doesn't exist |

---

### 3. Resend OTP

**POST** `/api/v1/nurse-auth/resend-otp`

**Request Body:**
```json
{
  "phone": "+256771234567"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "expiresAt": "2024-01-01T12:05:00.000Z"
    },
    "message": "OTP resent successfully"
  }
}
```

---

### 4. Check Registration Status

**GET** `/api/v1/nurse-auth/registration-status/:phone`

**Example:** `/api/v1/nurse-auth/registration-status/+256771234567`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "registered": true,
      "nurse": {
        "id": "64abc123...",
        "firstName": "Jane",
        "lastName": "Doe",
        "phone": "+256771234567",
        "email": "jane.doe@example.com",
        "documentVerificationStatus": "pending",
        "isVerified": false,
        "isActive": false
      }
    },
    "message": "Registration status retrieved successfully"
  }
}
```

---

## Profile Management

All profile endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

### 1. Get Profile

**GET** `/api/v1/nurse-portal/profile`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "nurse": {
        "id": "64abc123...",
        "firstName": "Jane",
        "lastName": "Doe",
        "phone": "+256771234567",
        "email": "jane.doe@example.com",
        "profilePicture": { /* full object */ },
        "nationalId": {
          "front": { /* document object */ },
          "back": { /* document object */ }
        },
        "qualifications": [
          {
            "id": "qual-uuid",
            "type": "certification",
            "title": "Registered Nurse License",
            "description": "Valid nursing license",
            "document": { /* document object */ },
            "uploadedAt": "2024-01-01T12:00:00.000Z"
          }
        ],
        "isActive": true,
        "isVerified": true,
        "documentVerificationStatus": "verified",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
      }
    },
    "message": "Profile retrieved successfully"
  }
}
```

---

### 2. Update Profile

**PATCH** `/api/v1/nurse-portal/profile`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "nurse": {
        "id": "64abc123...",
        "firstName": "Jane",
        "lastName": "Smith",
        "phone": "+256771234567",
        "email": "jane.smith@example.com"
      }
    },
    "message": "Profile updated successfully"
  }
}
```

---

### 3. Update Profile Picture

**POST** `/api/v1/nurse-portal/profile-picture`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Form Data:**
- `profilePicture` - New profile picture file

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "profilePicture": {
        "publicId": "new-id.jpg",
        "url": "new-id.jpg",
        "streamingUrl": "http://server.com/stream/image/new-id.jpg",
        "mimeType": "image/jpeg",
        "size": 245678,
        "uploadedAt": "2024-01-01T13:00:00.000Z",
        "originalName": "new-profile.jpg"
      }
    },
    "message": "Profile picture updated successfully"
  }
}
```

---

### 4. Add Qualifications

**POST** `/api/v1/nurse-portal/qualifications`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Form Data:**
- `qualifications` - Qualification document files (1-5 files)
- `qualificationsMeta` - JSON array of metadata

**Example:**
```javascript
const formData = new FormData();
formData.append('qualifications', file1);
formData.append('qualifications', file2);
formData.append('qualificationsMeta', JSON.stringify([
  { type: 'certification', title: 'CPR Certification', description: 'Basic life support' },
  { type: 'other', title: 'Training Certificate', description: 'ICU training' }
]));
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "qualifications": [ /* new qualifications */ ],
      "totalQualifications": 5
    },
    "message": "Qualifications added successfully"
  }
}
```

---

### 5. Delete Qualification

**DELETE** `/api/v1/nurse-portal/qualifications/:qualificationId`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "deletedQualificationId": "qual-uuid",
      "remainingQualifications": 4
    },
    "message": "Qualification deleted successfully"
  }
}
```

---

## Appointments

### 1. Get All Appointments

**GET** `/api/v1/nurse-portal/appointments`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `status` - Filter by status (optional): pending, assigned, in_progress, completed, cancelled
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:** `/api/v1/nurse-portal/appointments?status=in_progress&page=1&limit=10`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "appointments": [
        {
          "id": "64def456...",
          "patient": {
            "id": "64pat789...",
            "name": "John Patient",
            "phone": "+256701234567"
          },
          "symptoms": ["Fever", "Cough"],
          "description": "Patient experiencing high fever",
          "status": "in_progress",
          "date": "2024-01-01T14:00:00.000Z",
          "location": {
            "type": "Point",
            "coordinates": [32.5678, 0.3323]
          },
          "paymentStatus": "PAID",
          "payments": [ /* payment objects */ ],
          "createdAt": "2024-01-01T12:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 45,
        "pages": 3
      }
    },
    "message": "Appointments retrieved successfully"
  }
}
```

---

### 2. Get Single Appointment

**GET** `/api/v1/nurse-portal/appointments/:id`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "appointment": {
        "id": "64def456...",
        "patient": {
          "id": "64pat789...",
          "name": "John Patient",
          "phone": "+256701234567",
          "isPhoneVerified": true
        },
        "symptoms": ["Fever", "Cough", "Fatigue"],
        "description": "Patient experiencing high fever and persistent cough",
        "status": "in_progress",
        "date": "2024-01-01T14:00:00.000Z",
        "location": {
          "type": "Point",
          "coordinates": [32.5678, 0.3323]
        },
        "paymentStatus": "PAID",
        "payments": [
          {
            "id": "64pay123...",
            "amount": 50000,
            "status": "SUCCESSFUL",
            "paymentMethod": "MTN",
            "createdAt": "2024-01-01T13:30:00.000Z"
          }
        ],
        "nurseAssignedAt": "2024-01-01T12:30:00.000Z",
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    },
    "message": "Appointment retrieved successfully"
  }
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "body": {
    "data": null,
    "message": "Appointment not found or not assigned to you"
  }
}
```

---

### 3. Update Appointment Status

**PATCH** `/api/v1/nurse-portal/appointments/:id/status`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Allowed Status Values:**
- `in_progress` - Mark appointment as in progress
- `completed` - Mark appointment as completed

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "appointment": { /* updated appointment */ }
    },
    "message": "Appointment status updated successfully"
  }
}
```

---

## Payments

### 1. Initiate Payment for Appointment

**POST** `/api/v1/nurse-portal/appointments/:id/initiate-payment`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 50000,
  "description": "Home nursing visit payment"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "payment": {
        "id": "64pay123...",
        "amount": 50000,
        "reference": "uuid-v4-reference",
        "status": "PENDING",
        "phoneNumber": "+256701234567",
        "paymentMethod": "MTN",
        "initiatedAt": "2024-01-01T14:00:00.000Z"
      }
    },
    "message": "Payment initiated successfully. Patient will receive mobile money prompt."
  }
}
```

**What Happens:**
1. System detects provider (MTN/Airtel) from patient's phone
2. Payment request sent to MarzPay API
3. Patient receives mobile money prompt on their phone
4. Patient approves payment
5. Webhook updates payment status
6. Appointment paymentStatus updated

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Valid amount required | Amount is 0 or negative |
| 404 | Appointment not found | Invalid appointment ID or not assigned to you |
| 409 | Payment already completed | Appointment already has successful payment |
| 400 | Patient phone not available | Patient phone number missing |

---

### 2. Get Appointment Payments

**GET** `/api/v1/nurse-portal/appointments/:id/payments`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "payments": [
        {
          "id": "64pay123...",
          "amount": 50000,
          "amountFormatted": "50,000.00",
          "currency": "UGX",
          "reference": "uuid-reference",
          "status": "SUCCESSFUL",
          "paymentMethod": "MTN",
          "phoneNumber": "+256701234567",
          "description": "Payment for appointment",
          "initiatedAt": "2024-01-01T14:00:00.000Z",
          "completedAt": "2024-01-01T14:01:30.000Z",
          "transactionId": "MTN123456789",
          "createdAt": "2024-01-01T14:00:00.000Z"
        }
      ],
      "count": 1
    },
    "message": "Payments retrieved successfully"
  }
}
```

---

## Statistics

### Get Nurse Statistics

**GET** `/api/v1/nurse-portal/statistics`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "body": {
    "data": {
      "appointments": {
        "total": 45,
        "byStatus": {
          "pending": 5,
          "assigned": 3,
          "in_progress": 2,
          "completed": 32,
          "cancelled": 3
        }
      },
      "earnings": {
        "total": 1500000,
        "successfulPayments": 32
      }
    },
    "message": "Statistics retrieved successfully"
  }
}
```

---

## Technical Details

### File Storage

All uploaded files are stored on disk using the `diskStorageService`:

**File Structure:**
- Files stored in `/uploads` directory
- Each file gets unique UUID-based filename
- Original filenames preserved in metadata
- SHA-256 hash generated for integrity

**File Streaming:**
- Files accessible via streaming URLs
- Images: `/stream/image/:filename`
- PDFs: `/stream/pdf/:filename`
- Other documents: `/stream/media/:filename`

**Example Document Object:**
```json
{
  "publicId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "url": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "streamingUrl": "http://server.com/stream/image/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "mimeType": "image/jpeg",
  "size": 245678,
  "uploadedAt": "2024-01-01T12:00:00.000Z",
  "originalName": "profile-picture.jpg",
  "hash": "sha256-hash-here"
}
```

### Authentication Flow

**JWT Token:**
- Generated after successful OTP verification
- Contains nurse ID and account type
- Include in Authorization header: `Bearer <token>`
- Expires based on server configuration

**OTP Security:**
- 5-digit numeric code
- 5-minute expiry
- Stored in Redis
- Rate limited: 5 requests per minute per phone number

### Document Verification Statuses

| Status | Description | Can Sign In |
|--------|-------------|-------------|
| pending | Documents under review | No |
| verified | Documents approved | Yes (if active) |
| rejected | Documents rejected | No |

### Account States

| isVerified | isActive | Can Sign In |
|------------|----------|-------------|
| false | false | No - Pending verification |
| true | false | No - Account deactivated |
| true | true | Yes |
| false | true | No - Documents not verified |

---

## Frontend Integration

### Complete Registration Example

```javascript
// Step 1: Collect nurse information and files
const nurseData = {
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '+256771234567',
  email: 'jane.doe@example.com'
};

const files = {
  profilePicture: profilePictureFile,
  nationalIdFront: frontIdFile,
  nationalIdBack: backIdFile,
  qualifications: [certFile, cvFile]
};

const qualificationsMeta = [
  {
    type: 'certification',
    title: 'Registered Nurse License',
    description: 'Valid nursing license from UNMC'
  },
  {
    type: 'cv',
    title: 'Professional CV',
    description: 'My curriculum vitae with work experience'
  }
];

// Step 2: Create FormData
const formData = new FormData();
formData.append('firstName', nurseData.firstName);
formData.append('lastName', nurseData.lastName);
formData.append('phone', nurseData.phone);
formData.append('email', nurseData.email);
formData.append('profilePicture', files.profilePicture);
formData.append('nationalIdFront', files.nationalIdFront);
formData.append('nationalIdBack', files.nationalIdBack);

files.qualifications.forEach(file => {
  formData.append('qualifications', file);
});

formData.append('qualificationsMeta', JSON.stringify(qualificationsMeta));

// Step 3: Submit registration
try {
  const response = await fetch('/api/v1/nurse-auth/register', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (response.ok) {
    console.log('Registration successful:', data.body.data.nurse);
    // Show success message and explain verification process
  } else {
    console.error('Registration failed:', data.body.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Complete Sign In Example

```javascript
// Step 1: Request OTP
async function requestOTP(
phone) {
  const response = await fetch('/api/v1/nurse-auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });

  const data = await response.json();

  if (response.ok) {
    return {
      success: true,
      expiresAt: data.body.data.expiresAt,
      nurse: data.body.data.nurse
    };
  } else {
    return {
      success: false,
      error: data.body.message
    };
  }
}

// Step 2: Verify OTP
async function verifyOTP(phone, otp) {
  const response = await fetch('/api/v1/nurse-auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp })
  });

  const data = await response.json();

  if (response.ok) {
    // Save token
    localStorage.setItem('nurseToken', data.body.data.accessToken);
    localStorage.setItem('nurse', JSON.stringify(data.body.data.nurse));

    return {
      success: true,
      nurse: data.body.data.nurse,
      token: data.body.data.accessToken
    };
  } else {
    return {
      success: false,
      error: data.body.message
    };
  }
}

// Usage
const otpResult = await requestOTP('+256771234567');
if (otpResult.success) {
  // Show OTP input form
  const otp = await getUserOTPInput();
  const verifyResult = await verifyOTP('+256771234567', otp);

  if (verifyResult.success) {
    // Redirect to nurse portal
    window.location.href = '/nurse/dashboard';
  }
}
```

### Fetch Appointments Example

```javascript
async function fetchAppointments(page = 1, status = null) {
  const token = localStorage.getItem('nurseToken');
  const url = new URL('/api/v1/nurse-portal/appointments', window.location.origin);

  url.searchParams.append('page', page);
  if (status) url.searchParams.append('status', status);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (response.ok) {
    return {
      success: true,
      appointments: data.body.data.appointments,
      pagination: data.body.data.pagination
    };
  } else {
    return {
      success: false,
      error: data.body.message
    };
  }
}

// Usage
const result = await fetchAppointments(1, 'in_progress');
if (result.success) {
  console.log('Appointments:', result.appointments);
  console.log('Pagination:', result.pagination);
}
```

### Initiate Payment Example

```javascript
async function initiatePayment(appointmentId, amount, description) {
  const token = localStorage.getItem('nurseToken');

  const response = await fetch(
    `/api/v1/nurse-portal/appointments/${appointmentId}/initiate-payment`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, description })
    }
  );

  const data = await response.json();

  if (response.ok) {
    return {
      success: true,
      payment: data.body.data.payment
    };
  } else {
    return {
      success: false,
      error: data.body.message
    };
  }
}

// Usage
const result = await initiatePayment(
  '64def456...',
  50000,
  'Home nursing visit payment'
);

if (result.success) {
  alert('Payment initiated! Patient will receive mobile money prompt.');
}
```

---

## Best Practices

### For Nurses

1. **Registration:**
   - Use clear, high-quality photos for documents
   - Ensure National ID is valid and not expired
   - Provide accurate contact information
   - Upload relevant qualifications

2. **Authentication:**
   - Keep phone number active and accessible
   - Complete OTP verification within 5 minutes
   - Don't share OTP codes with anyone

3. **Profile:**
   - Keep profile information up to date
   - Maintain professional profile picture
   - Add new qualifications as obtained

4. **Appointments:**
   - Update appointment status promptly
   - Review patient details before visit
   - Initiate payments after service delivery

5. **Payments:**
   - Verify amount before initiating payment
   - Confirm patient phone number is correct
   - Check payment status after initiation

### For Developers

1. **Security:**
   - Always validate tokens
   - Implement proper error handling
   - Don't expose sensitive information in errors
   - Rate limit authentication endpoints

2. **File Uploads:**
   - Validate file types and sizes
   - Use progress indicators for uploads
   - Handle network errors gracefully
   - Show preview before upload

3. **User Experience:**
   - Provide clear feedback on verification status
   - Show loading states during operations
   - Implement proper pagination for lists
   - Cache frequently accessed data

4. **Error Handling:**
   - Display user-friendly error messages
   - Provide retry mechanisms
   - Log errors for debugging
   - Handle network failures

---

## Support

For issues or questions:
1