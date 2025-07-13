# Account Deletion API Documentation

This document describes the account deletion system that complies with Google Play Store policies for data deletion requests.

## Overview

The account deletion system provides multiple ways for users to request account deletion:

- **Public Web Page**: Accessible to anyone without authentication
- **Mobile App API**: For authenticated users within the mobile app
- **Admin Controls**: For administrators to manage deletion requests

## Google Play Store Compliance

This implementation follows Google Play Store requirements:

- ✅ **Public Deletion Page**: Accessible without login
- ✅ **7-Day Grace Period**: Users can cancel deletion within 7 days
- ✅ **Clear Information**: Users are informed about data deletion consequences
- ✅ **Multiple Access Methods**: Web page and mobile app integration
- ✅ **Admin Oversight**: Administrators can manage and force delete accounts

## Authentication Note

The system supports both legacy phone+password authentication and email+password authentication:

- **Patients**: Use phone number and password for authentication
- **Nurses**: Use email and password for authentication
- **Admins**: Use email and password for authentication

## Public Web Page

### URL: `/account-deletion`

A public HTML page that allows anyone to request account deletion by providing their email or phone number.

**Features:**

- No authentication required
- Form validation
- Real-time feedback
- Mobile-responsive design
- Clear information about deletion consequences

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Request Account Deletion (Public)

**Endpoint:** `POST /account-deletion/request`

**Description:** Public endpoint for requesting account deletion (Google Play Store compliance)

**Body:**

```json
{
	"email": "user@example.com", // Optional
	"phone": "0755123456", // Optional
	"reason": "No longer using the service", // Optional
	"confirmation": true // Required - must be true
}
```

**Response:**

```json
{
	"success": true,
	"message": "Account deletion request submitted successfully. Your account will be deleted within 7 days.",
	"data": {
		"accountId": "507f1f77bcf86cd799439011",
		"accountType": "patient",
		"deletionRequestDate": "2024-01-15T10:30:00.000Z",
		"estimatedDeletionDate": "2024-01-22T10:30:00.000Z"
	}
}
```

### Authenticated Endpoints

#### 2. Get Deletion Status

**Endpoint:** `GET /account-deletion/status`

**Description:** Get deletion status for authenticated user

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
	"success": true,
	"message": "Account deletion status retrieved successfully",
	"data": {
		"accountId": "507f1f77bcf86cd799439011",
		"accountType": "patient",
		"markedForDeletion": true,
		"deletionRequestDate": "2024-01-15T10:30:00.000Z",
		"deletionReason": "User requested account deletion",
		"deletionRequestSource": "web",
		"estimatedDeletionDate": "2024-01-22T10:30:00.000Z",
		"canCancel": true
	}
}
```

#### 3. Cancel Deletion Request

**Endpoint:** `POST /account-deletion/cancel`

**Description:** Cancel account deletion request for authenticated user

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
	"success": true,
	"message": "Account deletion request cancelled successfully",
	"data": {
		"accountId": "507f1f77bcf86cd799439011",
		"accountType": "patient"
	}
}
```

#### 4. Request Deletion (Authenticated)

**Endpoint:** `POST /account-deletion/request-authenticated`

**Description:** Request account deletion for authenticated user (mobile app)

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Body:**

```json
{
	"reason": "No longer using the service", // Optional
	"confirmation": true // Required
}
```

**Response:**

```json
{
	"success": true,
	"message": "Account deletion request submitted successfully. Your account will be deleted within 7 days.",
	"data": {
		"accountId": "507f1f77bcf86cd799439011",
		"accountType": "patient",
		"deletionRequestDate": "2024-01-15T10:30:00.000Z",
		"estimatedDeletionDate": "2024-01-22T10:30:00.000Z"
	}
}
```

### Admin Endpoints

#### 5. Get Pending Deletion Requests

**Endpoint:** `GET /account-deletion/admin/pending`

**Description:** Get all pending deletion requests (admin only)

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
	"success": true,
	"message": "Pending deletion requests retrieved successfully",
	"data": {
		"nurses": [
			{
				"id": "507f1f77bcf86cd799439011",
				"type": "nurse",
				"name": "John Doe",
				"email": "john@example.com",
				"phone": "0755123456",
				"deletionRequestDate": "2024-01-15T10:30:00.000Z",
				"deletionReason": "User requested account deletion",
				"deletionRequestSource": "web",
				"estimatedDeletionDate": "2024-01-22T10:30:00.000Z"
			}
		],
		"patients": [
			{
				"id": "507f1f77bcf86cd799439012",
				"type": "patient",
				"name": "Jane Smith",
				"phone": "0755123457",
				"deletionRequestDate": "2024-01-15T10:30:00.000Z",
				"deletionReason": "User requested account deletion",
				"deletionRequestSource": "mobile",
				"estimatedDeletionDate": "2024-01-22T10:30:00.000Z"
			}
		],
		"admins": [
			{
				"id": "507f1f77bcf86cd799439013",
				"type": "admin",
				"name": "admin@example.com",
				"email": "admin@example.com",
				"deletionRequestDate": "2024-01-15T10:30:00.000Z",
				"deletionReason": "User requested account deletion",
				"deletionRequestSource": "web",
				"estimatedDeletionDate": "2024-01-22T10:30:00.000Z"
			}
		]
	}
}
```

#### 6. Force Delete Account

**Endpoint:** `POST /account-deletion/admin/force-delete`

**Description:** Force delete an account immediately (admin only)

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Body:**

```json
{
	"accountId": "507f1f77bcf86cd799439011",
	"targetAccountType": "patient"
}
```

**Response:**

```json
{
	"success": true,
	"message": "patient account deleted successfully",
	"data": {
		"accountId": "507f1f77bcf86cd799439011",
		"accountType": "patient",
		"deletedBy": "admin123",
		"deletedAt": "2024-01-15T11:00:00.000Z"
	}
}
```

#### 7. Cancel Deletion Request (Admin)

**Endpoint:** `POST /account-deletion/admin/cancel`

**Description:** Cancel deletion request for any account (admin only)

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Body:**

```json
{
	"accountId": "507f1f77bcf86cd799439011",
	"targetAccountType": "patient"
}
```

**Response:**

```json
{
	"success": true,
	"message": "Account deletion request cancelled successfully",
	"data": {
		"accountId": "507f1f77bcf86cd799439011",
		"accountType": "patient"
	}
}
```

## Database Schema

### Account Deletion Fields

All account models (Nurse, Patient, Admin) include these deletion fields:

```typescript
// Account deletion fields (Google Play Store compliance)
markedForDeletion?: boolean;           // Whether account is marked for deletion
deletionRequestDate?: Date;            // When deletion was requested
deletionReason?: string;               // Reason for deletion
deletionRequestSource?: 'web' | 'mobile' | 'admin'; // How deletion was requested
deletionConfirmed?: boolean;           // Whether admin confirmed deletion
deletionConfirmedDate?: Date;          // When deletion was confirmed
deletionConfirmedBy?: string;          // Who confirmed deletion (admin ID or 'system')
```

### Patient Model Updates

The Patient model now includes a password field for legacy phone+password authentication:

```typescript
@prop({ type: String, required: true, minlength: 8 })
password!: string;
```

## Deletion Process

### 1. Request Phase

- User requests account deletion via web page or mobile app
- Account is marked with `markedForDeletion: true`
- `deletionRequestDate` is set to current timestamp
- User receives confirmation with 7-day grace period

### 2. Grace Period (7 Days)

- User can cancel deletion request by logging in
- Admin can view pending deletion requests
- Admin can force delete or cancel requests
- System logs all actions for audit trail

### 3. Automatic Deletion

- Cron job runs daily at midnight
- Finds accounts marked for deletion older than 7 days
- Automatically deletes accounts and related data
- Cleans up associated files and appointments

### 4. Data Cleanup

When an account is deleted:

- **Nurses**: Profile pictures, documents, and qualifications are deleted from Cloudinary
- **All Users**: Associated appointments are cancelled
- **Database**: Account record is permanently removed
- **Logs**: Deletion is logged for audit purposes

## Error Handling

### Common Error Responses

**Missing Confirmation:**

```json
{
	"success": false,
	"message": "Account deletion confirmation is required"
}
```

**Account Not Found:**

```json
{
	"success": false,
	"message": "Account not found with the provided email or phone number"
}
```

**Already Marked for Deletion:**

```json
{
	"success": false,
	"message": "Account is already marked for deletion"
}
```

**Unauthorized Access:**

```json
{
	"success": false,
	"message": "Admin access required"
}
```

## Security Features

1. **Public Access**: Deletion page accessible without authentication
2. **Confirmation Required**: Users must explicitly confirm deletion
3. **Grace Period**: 7-day window to cancel deletion
4. **Admin Oversight**: Administrators can manage all deletion requests
5. **Audit Trail**: All deletion actions are logged
6. **Data Cleanup**: Complete removal of user data and associated files

## Mobile App Integration

### Request Deletion from Mobile App

```javascript
// Request deletion for authenticated user
const response = await fetch('/account-deletion/request-authenticated', {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		reason: 'No longer using the service',
		confirmation: true,
	}),
});

const result = await response.json();
```

### Check Deletion Status

```javascript
// Check if user's account is marked for deletion
const response = await fetch('/account-deletion/status', {
	headers: {
		Authorization: `Bearer ${token}`,
	},
});

const result = await response.json();
if (result.data.markedForDeletion) {
	// Show deletion status and cancel option
}
```

### Cancel Deletion Request

```javascript
// Cancel deletion request
const response = await fetch('/account-deletion/cancel', {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${token}`,
	},
});

const result = await response.json();
```

## Testing

### Test Account Deletion Flow

1. **Public Page Test:**
   - Visit `/account-deletion`
   - Fill out form with valid email/phone
   - Submit and verify confirmation

2. **Mobile App Test:**
   - Use authenticated endpoint
   - Request deletion and check status
   - Cancel deletion request

3. **Admin Test:**
   - View pending deletion requests
   - Force delete an account
   - Cancel a deletion request

4. **Cron Job Test:**
   - Create test account marked for deletion
   - Set deletion date to 8 days ago
   - Run cron job and verify deletion

## Compliance Checklist

- ✅ **Public Deletion Page**: `/account-deletion`
- ✅ **No Authentication Required**: Public access to deletion page
- ✅ **Clear Information**: Users informed about data deletion
- ✅ **Grace Period**: 7-day cancellation window
- ✅ **Multiple Access Methods**: Web page and mobile app
- ✅ **Admin Controls**: Full management capabilities
- ✅ **Data Cleanup**: Complete removal of user data
- ✅ **Audit Trail**: All actions logged
- ✅ **Error Handling**: Comprehensive error responses

## Support

For questions about the account deletion system:

- **Email**: ianbalijawa16@gmail.com
- **Response Time**: Within 24-48 hours
- **Documentation**: This document and inline code comments
