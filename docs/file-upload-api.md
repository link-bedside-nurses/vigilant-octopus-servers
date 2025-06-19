# File Upload API Documentation

This document describes the file upload and retrieval service using Cloudinary for nurse document management.

## Overview

The file upload service provides secure, scalable document storage for nurse profiles, including:

- Profile pictures
- National ID documents (front and back)
- Qualification documents (certifications, CVs, etc.)
- Document verification workflow
- **Payment-Appointment Linking**: Payments are now robustly linked to appointments, and payment status is tracked on the appointment. This enables accurate document and payment management for nurse and patient workflows.
- **Data Consistency**: All DTOs now match the database models, including GeoJSON for location fields. All create/update APIs expect/request the same fields as the models.

## Features

- **Cloud Storage**: All files are stored securely in Cloudinary
- **File Validation**: Automatic file type and size validation
- **Document Management**: Complete CRUD operations for nurse documents
- **Verification Workflow**: Admin-controlled document verification process
- **Automatic Cleanup**: Files are automatically deleted when nurses are removed

## API Endpoints

### Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### 1. Upload Profile Picture

**Endpoint:** `POST /nurses/:id/profile-picture`

**Description:** Upload a profile picture for a nurse

**Headers:**

```
Content-Type: multipart/form-data
```

**Body:**

- `profilePicture` (file): Image file (JPG, PNG, GIF) - max 5MB

**Response:**

```json
{
	"success": true,
	"message": "Profile picture uploaded successfully",
	"data": {
		"nurseId": "507f1f77bcf86cd799439011",
		"profilePicture": {
			"publicId": "nurses/507f1f77bcf86cd799439011/profile/abc123",
			"url": "http://res.cloudinary.com/...",
			"secureUrl": "https://res.cloudinary.com/...",
			"format": "jpg",
			"resourceType": "image",
			"size": 1024000,
			"uploadedAt": "2024-01-15T10:30:00.000Z",
			"originalName": "profile.jpg"
		}
	}
}
```

### 2. Upload National ID Documents

**Endpoint:** `POST /nurses/:id/national-id`

**Description:** Upload front and back images of national ID

**Headers:**

```
Content-Type: multipart/form-data
```

**Body:**

- `front` (file): Front image of national ID (JPG, PNG, PDF) - max 10MB
- `back` (file): Back image of national ID (JPG, PNG, PDF) - max 10MB

**Response:**

```json
{
	"success": true,
	"message": "National ID documents uploaded successfully",
	"data": {
		"nurseId": "507f1f77bcf86cd799439011",
		"nationalId": {
			"front": {
				"publicId": "nurses/507f1f77bcf86cd799439011/national-id/507f1f77bcf86cd799439011_national_id_front",
				"url": "http://res.cloudinary.com/...",
				"secureUrl": "https://res.cloudinary.com/...",
				"format": "jpg",
				"resourceType": "image",
				"size": 2048000,
				"uploadedAt": "2024-01-15T10:30:00.000Z",
				"originalName": "front.jpg"
			},
			"back": {
				"publicId": "nurses/507f1f77bcf86cd799439011/national-id/507f1f77bcf86cd799439011_national_id_back",
				"url": "http://res.cloudinary.com/...",
				"secureUrl": "https://res.cloudinary.com/...",
				"format": "jpg",
				"resourceType": "image",
				"size": 1985000,
				"uploadedAt": "2024-01-15T10:30:00.000Z",
				"originalName": "back.jpg"
			}
		}
	}
}
```

### 3. Upload Qualification Document

**Endpoint:** `POST /nurses/:id/qualifications`

**Description:** Upload a qualification document (certification, CV, etc.)

**Headers:**

```
Content-Type: multipart/form-data
```

**Body:**

- `document` (file): Document file (JPG, PNG, PDF, DOC, DOCX) - max 15MB
- `title` (string): Document title (required)
- `type` (string): Document type - "certification", "cv", or "other" (optional, default: "certification")
- `description` (string): Document description (optional)

**Response:**

```json
{
	"success": true,
	"message": "Qualification document uploaded successfully",
	"data": {
		"nurseId": "507f1f77bcf86cd799439011",
		"qualification": {
			"id": "nurses/507f1f77bcf86cd799439011/qualifications/def456",
			"type": "certification",
			"document": {
				"publicId": "nurses/507f1f77bcf86cd799439011/qualifications/def456",
				"url": "http://res.cloudinary.com/...",
				"secureUrl": "https://res.cloudinary.com/...",
				"format": "pdf",
				"resourceType": "raw",
				"size": 5120000,
				"uploadedAt": "2024-01-15T10:30:00.000Z",
				"originalName": "nursing_certificate.pdf"
			},
			"title": "Nursing Certification",
			"description": "Professional nursing certification from accredited institution",
			"uploadedAt": "2024-01-15T10:30:00.000Z"
		}
	}
}
```

### 4. Delete Qualification Document

**Endpoint:** `DELETE /nurses/:id/qualifications/:qualificationId`

**Description:** Delete a specific qualification document

**Response:**

```json
{
	"success": true,
	"message": "Qualification document deleted successfully",
	"data": {
		"nurseId": "507f1f77bcf86cd799439011",
		"deletedQualificationId": "nurses/507f1f77bcf86cd799439011/qualifications/def456"
	}
}
```

### 5. Get Documents Summary

**Endpoint:** `GET /nurses/:id/documents`

**Description:** Get a summary of all documents for a nurse

**Response:**

```json
{
	"success": true,
	"message": "Nurse documents summary retrieved successfully",
	"data": {
		"nurseId": "507f1f77bcf86cd799439011",
		"hasProfilePicture": true,
		"hasNationalID": true,
		"qualificationsCount": 3,
		"documentVerificationStatus": "pending",
		"documents": {
			"profilePicture": {
				"url": "https://res.cloudinary.com/...",
				"size": 1024000,
				"uploadedAt": "2024-01-15T10:30:00.000Z"
			},
			"nationalId": {
				"front": {
					"url": "https://res.cloudinary.com/...",
					"size": 2048000,
					"uploadedAt": "2024-01-15T10:30:00.000Z"
				},
				"back": {
					"url": "https://res.cloudinary.com/...",
					"size": 1985000,
					"uploadedAt": "2024-01-15T10:30:00.000Z"
				}
			},
			"qualifications": [
				{
					"id": "nurses/507f1f77bcf86cd799439011/qualifications/def456",
					"type": "certification",
					"title": "Nursing Certification",
					"description": "Professional nursing certification",
					"url": "https://res.cloudinary.com/...",
					"size": 5120000,
					"uploadedAt": "2024-01-15T10:30:00.000Z"
				}
			]
		}
	}
}
```

### 6. Update Document Verification Status (Admin Only)

**Endpoint:** `PATCH /nurses/:id/verification-status`

**Description:** Update the verification status of nurse documents (admin only)

**Body:**

```json
{
	"status": "verified", // "pending", "verified", or "rejected"
	"notes": "Documents verified successfully" // optional
}
```

**Response:**

```json
{
	"success": true,
	"message": "Document verification status updated successfully",
	"data": {
		"nurseId": "507f1f77bcf86cd799439011",
		"status": "verified"
	}
}
```

## File Requirements

### Supported File Types

- **Images**: JPG, JPEG, PNG, GIF
- **Documents**: PDF, DOC, DOCX

### File Size Limits

- **Profile Pictures**: 5MB
- **National ID Documents**: 10MB each
- **Qualification Documents**: 15MB each

### File Naming

- Files are automatically renamed using Cloudinary's public ID system
- Original filenames are preserved in the metadata

## Error Handling

### Common Error Responses

**File Too Large:**

```json
{
	"success": false,
	"message": "File too large. Maximum size is 15MB"
}
```

**Invalid File Type:**

```json
{
	"success": false,
	"message": "Only PDF, Word documents, and images are allowed"
}
```

**Missing Files:**

```json
{
	"success": false,
	"message": "Both front and back national ID images are required"
}
```

**Nurse Not Found:**

```json
{
	"success": false,
	"message": "Nurse not found"
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

1. **Authentication Required**: All endpoints require valid JWT tokens
2. **File Validation**: Automatic validation of file types and sizes
3. **Secure URLs**: All Cloudinary URLs use HTTPS
4. **Access Control**: Document verification requires admin privileges
5. **Automatic Cleanup**: Files are deleted when nurse accounts are removed

## Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Usage Examples

### Upload Profile Picture (JavaScript)

```javascript
const formData = new FormData();
formData.append('profilePicture', file);

const response = await fetch('/nurses/123/profile-picture', {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${token}`,
	},
	body: formData,
});

const result = await response.json();
```

### Upload National ID (JavaScript)

```javascript
const formData = new FormData();
formData.append('front', frontFile);
formData.append('back', backFile);

const response = await fetch('/nurses/123/national-id', {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${token}`,
	},
	body: formData,
});

const result = await response.json();
```

### Upload Qualification (JavaScript)

```javascript
const formData = new FormData();
formData.append('document', documentFile);
formData.append('title', 'Nursing Certification');
formData.append('type', 'certification');
formData.append('description', 'Professional certification');

const response = await fetch('/nurses/123/qualifications', {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${token}`,
	},
	body: formData,
});

const result = await response.json();
```

## Notes

- All file uploads are processed asynchronously
- Files are stored in organized folders within Cloudinary
- Document verification status is automatically reset to "pending" when new documents are uploaded
- The service automatically handles file cleanup when nurses are deleted
- All responses include detailed metadata about uploaded files
