# Nurse Assignment API Documentation

This document describes the nurse assignment system for appointments, including automatic notifications and status management.

## Overview

The nurse assignment system allows administrators to assign nurses to pending appointments. When a nurse is assigned:

- Appointment status changes from `pending` to `assigned`
- Both nurse and patient receive notifications via email and SMS
- Assignment details are tracked for audit purposes
- Nurses can view their assigned appointments

## Appointment Status Flow

1. **PENDING** - Patient books appointment (no nurse assigned)
2. **ASSIGNED** - Admin assigns nurse to appointment
3. **IN_PROGRESS** - Nurse confirms and starts appointment
4. **COMPLETED** - Appointment is finished
5. **CANCELLED** - Appointment is cancelled

## API Endpoints

### Admin Endpoints (Admin Access Required)

#### 1. Get Pending Appointments

**Endpoint:** `GET /api/v1/appointments/pending`

**Description:** Get all pending appointments without assigned nurses

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
	"success": true,
	"message": "Pending appointments retrieved successfully",
	"data": [
		{
			"id": "507f1f77bcf86cd799439011",
			"patient": {
				"id": "507f1f77bcf86cd799439012",
				"name": "John Doe",
				"phone": "0755123456"
			},
			"symptoms": ["fever", "headache"],
			"date": "2024-01-20T10:00:00.000Z",
			"status": "pending",
			"createdAt": "2024-01-15T10:30:00.000Z"
		}
	]
}
```

#### 2. Get Available Nurses

**Endpoint:** `GET /api/v1/appointments/available-nurses`

**Description:** Get all active and verified nurses available for assignment

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
```

**Response:**

```json
{
	"success": true,
	"message": "Available nurses retrieved successfully",
	"data": [
		{
			"id": "507f1f77bcf86cd799439013",
			"firstName": "Jane",
			"lastName": "Smith",
			"email": "jane.smith@example.com",
			"phone": "0755123457",
			"isActive": true,
			"isVerified": true
		}
	]
}
```

#### 3. Assign Nurse to Appointment

**Endpoint:** `POST /api/v1/appointments/:appointmentId/assign-nurse`

**Description:** Assign a nurse to a pending appointment

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Body:**

```json
{
	"nurseId": "507f1f77bcf86cd799439013",
	"notes": "Patient prefers female nurse"
}
```

**Response:**

```json
{
	"success": true,
	"message": "Nurse assigned successfully",
	"data": {
		"appointmentId": "507f1f77bcf86cd799439011",
		"nurseId": "507f1f77bcf86cd799439013",
		"status": "assigned",
		"nurseAssignedAt": "2024-01-15T11:00:00.000Z",
		"notifications": [
			{
				"recipient": "nurse",
				"channel": "email",
				"success": true
			},
			{
				"recipient": "nurse",
				"channel": "sms",
				"success": true
			},
			{
				"recipient": "patient",
				"channel": "sms",
				"success": true
			}
		]
	}
}
```

#### 4. Reassign Nurse to Appointment

**Endpoint:** `POST /api/v1/appointments/:appointmentId/reassign-nurse`

**Description:** Reassign a different nurse to an appointment

**Headers:**

```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Body:**

```json
{
	"nurseId": "507f1f77bcf86cd799439014",
	"reason": "Original nurse unavailable"
}
```

**Response:**

```json
{
	"success": true,
	"message": "Nurse reassigned successfully",
	"data": {
		"appointmentId": "507f1f77bcf86cd799439011",
		"oldNurseId": "507f1f77bcf86cd799439013",
		"newNurseId": "507f1f77bcf86cd799439014",
		"status": "assigned",
		"nurseAssignedAt": "2024-01-15T11:30:00.000Z"
	}
}
```

### Nurse Endpoints

#### 5. Get Nurse's Appointments

**Endpoint:** `GET /api/v1/appointments/nurse/:nurseId`

**Description:** Get appointments assigned to a specific nurse

**Headers:**

```
Authorization: Bearer <nurse-jwt-token> or <admin-jwt-token>
```

**Response:**

```json
{
	"success": true,
	"message": "Nurse appointments retrieved successfully",
	"data": [
		{
			"id": "507f1f77bcf86cd799439011",
			"patient": {
				"id": "507f1f77bcf86cd799439012",
				"name": "John Doe",
				"phone": "0755123456"
			},
			"symptoms": ["fever", "headache"],
			"date": "2024-01-20T10:00:00.000Z",
			"status": "assigned",
			"nurseAssignedAt": "2024-01-15T11:00:00.000Z",
			"assignmentNotes": "Patient prefers female nurse"
		}
	]
}
```

## Database Schema Updates

### Appointment Model

The Appointment model now includes nurse assignment fields:

```typescript
// Nurse assignment fields
nurseAssignedAt?: Date;                    // When nurse was assigned
assignedBy?: Ref<Admin>;                   // Admin who assigned the nurse
assignmentNotes?: string;                  // Notes about the assignment
nurseNotified?: boolean;                   // Whether nurse was notified
patientNotified?: boolean;                 // Whether patient was notified
lastNotificationSent?: Date;               // When last notification was sent

// Cancellation fields
cancellationReason?: string;               // Reason for cancellation
cancelledBy?: Ref<Admin>;                  // Admin who cancelled
cancelledAt?: Date;                        // When appointment was cancelled
```

## Notification System

### Nurse Notifications

When a nurse is assigned to an appointment, they receive:

1. **Email Notification** with:

   - Patient details
   - Appointment date and time
   - Patient symptoms
   - Assignment confirmation request

2. **SMS Notification** with:
   - Brief assignment confirmation
   - Request to check email for details

### Patient Notifications

When a nurse is assigned, the patient receives:

1. **SMS Notification** with:
   - Confirmation that a nurse has been assigned
   - Information that the nurse will contact them shortly

### Reassignment Notifications

When a nurse is reassigned:

1. **Old Nurse** receives email notification about being unassigned
2. **New Nurse** receives full assignment notification
3. **Patient** receives SMS about nurse change

## Notification Templates

### Nurse Assignment Email Template

```html
<h2>New Appointment Assignment</h2>
<p>Hello [Nurse Name],</p>
<p>You have been assigned to a new appointment with the following details:</p>
<ul>
	<li><strong>Patient:</strong> [Patient Name]</li>
	<li><strong>Date:</strong> [Appointment Date]</li>
	<li><strong>Time:</strong> [Appointment Time]</li>
	<li><strong>Symptoms:</strong> [Patient Symptoms]</li>
</ul>
<p>Please review the appointment details and confirm your availability.</p>
<p>Best regards,<br />Link Bed Sides Team</p>
```

### SMS Templates

**Nurse Assignment SMS:**

```
You have been assigned to an appointment with [Patient Name] on [Date]. Please check your email for details.
```

**Patient Notification SMS:**

```
A nurse has been assigned to your appointment on [Date]. You will be contacted shortly.
```

## Error Handling

### Common Error Responses

**Appointment Not Found:**

```json
{
	"success": false,
	"message": "Appointment not found"
}
```

**Appointment Not in Pending Status:**

```json
{
	"success": false,
	"message": "Appointment is not in pending status"
}
```

**Nurse Not Found:**

```json
{
	"success": false,
	"message": "Nurse not found"
}
```

**Nurse Not Active:**

```json
{
	"success": false,
	"message": "Nurse is not active"
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

1. **Admin-Only Assignment**: Only administrators can assign nurses
2. **Status Validation**: Only pending appointments can be assigned
3. **Nurse Validation**: Only active and verified nurses can be assigned
4. **Audit Trail**: All assignments are tracked with timestamps and admin details
5. **Notification Tracking**: System tracks whether notifications were sent successfully

## Usage Examples

### Assign Nurse to Appointment

```javascript
// Admin assigns nurse to appointment
const response = await fetch('/api/v1/appointments/507f1f77bcf86cd799439011/assign-nurse', {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${adminToken}`,
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		nurseId: '507f1f77bcf86cd799439013',
		notes: 'Patient prefers female nurse',
	}),
});

const result = await response.json();
```

### Get Pending Appointments

```javascript
// Admin gets pending appointments
const response = await fetch('/api/v1/appointments/pending', {
	headers: {
		Authorization: `Bearer ${adminToken}`,
	},
});

const result = await response.json();
```

### Get Nurse's Appointments

```javascript
// Nurse gets their assigned appointments
const response = await fetch('/api/v1/appointments/nurse/507f1f77bcf86cd799439013', {
	headers: {
		Authorization: `Bearer ${nurseToken}`,
	},
});

const result = await response.json();
```

## Testing Scenarios

### 1. Basic Assignment Flow

1. Create a pending appointment
2. Get available nurses
3. Assign nurse to appointment
4. Verify status change to 'assigned'
5. Check notification delivery

### 2. Reassignment Flow

1. Assign nurse to appointment
2. Reassign to different nurse
3. Verify old nurse is unassigned
4. Check reassignment notifications

### 3. Error Handling

1. Try to assign nurse to non-pending appointment
2. Try to assign inactive nurse
3. Try to assign without admin privileges
4. Verify appropriate error responses

### 4. Notification Testing

1. Assign nurse with email and phone
2. Verify both email and SMS are sent
3. Check notification content accuracy
4. Test notification failure handling

## Integration with Existing Systems

### Messaging Service Integration

- Uses existing `messagingService` for notifications
- Supports both email and SMS channels
- Handles notification failures gracefully

### Database Integration

- Extends existing Appointment model
- Maintains referential integrity
- Supports audit trail requirements

### Authentication Integration

- Uses existing authentication middleware
- Supports role-based access control
- Maintains security standards

## Performance Considerations

1. **Database Indexing**: Nurse field is indexed for efficient queries
2. **Notification Batching**: Notifications are sent asynchronously
3. **Caching**: Available nurses can be cached for better performance
4. **Error Recovery**: Failed notifications are logged but don't block assignment

## Monitoring and Logging

The system includes comprehensive logging for:

- Assignment operations
- Notification delivery status
- Error conditions
- Performance metrics

All operations are logged with appropriate detail levels for debugging and monitoring.

## Payment Status Tracking on Appointments

- Each appointment now includes a `paymentStatus` field (`'UNPAID' | 'PENDING' | 'PAID' | 'FAILED'`).
- The `payments` array on the appointment contains all related payment records.
- Payment processing is robustly linked to appointments, ensuring accurate billing and workflow management.

## Appointment Location Capture

Location coordinates are now collected during appointment scheduling and stored on the appointment.

**Endpoint:** `POST /appointments`

**Description:** Schedule an appointment. Optionally include location via a GeoJSON `location` field or a raw `coordinates` tuple `[longitude, latitude]`. If provided, the server normalizes into a GeoJSON Point and indexes it for geospatial queries.

**Request Body (examples):**

```json
{
  "patientId": "...",
  "nurseId": "...",
  "scheduledAt": "2025-01-01T10:00:00Z",
  "location": { "type": "Point", "coordinates": [32.5678668, 0.3323315] }
}
```

```json
{
  "patientId": "...",
  "scheduledAt": "2025-01-01T10:00:00Z",
  "coordinates": [32.5678668, 0.3323315]
}
```

> Longitude must be between -180 and 180; Latitude must be between -90 and 90.

**Behavior:**
- If `location` or `coordinates` are provided, the server sets `appointment.location` to a GeoJSON Point.
- If neither is provided, the appointment is created without a location.
- Existing patient APIs no longer accept or expose location coordinates.

> **Note:** DTOs and models remain aligned. Appointment `location` uses GeoJSON for consistency across the platform.
