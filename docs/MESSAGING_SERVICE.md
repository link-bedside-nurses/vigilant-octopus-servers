# Messaging Service Documentation

## Overview

The Messaging Service is a unified, robust system that handles all communication needs within the application, including:

- **OTP Generation & Verification** (SMS & Email)
- **Notifications** (SMS & Email)
- **Bulk Messaging**
- **Health Monitoring**
- **Message Statistics**

## Features

### 🔐 OTP Management

- Generate secure 6-digit OTPs
- Store OTPs in Redis with configurable expiry (default: 5 minutes)
- Verify OTPs with automatic cleanup
- Support for both SMS and Email channels

### 📱 SMS Integration

- Infobip SMS service integration
- Automatic phone number validation
- Delivery status tracking
- Error handling and retry logic

### 📧 Email Integration

- Nodemailer with Gmail SMTP
- HTML email templates
- Delivery confirmation
- Attachment support

### 🔄 Redis Integration

- OTP storage with TTL
- Automatic cleanup
- Connection pooling
- Health monitoring

### 📊 Monitoring & Analytics

- Service health checks
- Message delivery statistics
- Error tracking
- Performance metrics

## API Endpoints

### Authentication OTP (Integrated with Auth Controller)

#### Patient OTP Flow

```http
POST /api/v1/auth/patient/signin
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

```http
POST /api/v1/auth/patient/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456",
  "name": "John Doe" // Optional for new users
}
```

#### Admin OTP Flow

```http
POST /api/v1/auth/admin/signup
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

```http
POST /api/v1/auth/admin/verify-otp
Content-Type: application/json

{
  "email": "admin@example.com",
  "otp": "123456"
}
```

### Messaging Service Endpoints

#### Send Single Notification

```http
POST /api/v1/messaging/send-notification
Content-Type: application/json

{
  "recipient": "user@example.com",
  "message": "Your appointment has been confirmed!",
  "channel": "email", // "sms", "email", or "both"
  "priority": "normal", // "low", "normal", "high", "urgent"
  "subject": "Appointment Confirmation",
  "metadata": {
    "appointmentId": "12345",
    "type": "confirmation"
  }
}
```

#### Send Bulk Notifications

```http
POST /api/v1/messaging/send-bulk-notifications
Content-Type: application/json

{
  "recipients": ["user1@example.com", "+1234567890", "user2@example.com"],
  "message": "System maintenance scheduled for tomorrow.",
  "channel": "both",
  "priority": "high",
  "subject": "System Maintenance Notice"
}
```

#### Send OTP

```http
POST /api/v1/messaging/send-otp
Content-Type: application/json

{
  "identifier": "user@example.com", // or phone number
  "channel": "email", // "sms" or "email"
  "expiryTime": 300 // Optional: seconds (60-3600)
}
```

#### Verify OTP

```http
POST /api/v1/messaging/verify-otp
Content-Type: application/json

{
  "identifier": "user@example.com",
  "otp": "123456"
}
```

#### Health Check

```http
GET /api/v1/messaging/health
```

#### Get Statistics

```http
GET /api/v1/messaging/stats
```

## Usage Examples

### In Controllers

```typescript
import { messagingService, ChannelType, MessagePriority } from '../services/messaging';

// Send OTP via SMS
const otpResult = await messagingService.sendOTPViaSMS('+1234567890');

// Send OTP via Email
const otpResult = await messagingService.sendOTPViaEmail('user@example.com');

// Verify OTP
const isValid = await messagingService.verifyOTP('user@example.com', '123456');

// Send notification
const results = await messagingService.sendNotification(
	'user@example.com',
	'Your appointment is confirmed!',
	{
		channel: ChannelType.EMAIL,
		priority: MessagePriority.HIGH,
		template: {
			subject: 'Appointment Confirmation',
			text: 'Your appointment is confirmed!',
			html: '<h1>Appointment Confirmed</h1>',
		},
	}
);

// Send bulk notifications
const bulkResults = await messagingService.sendBulkNotifications(
	['user1@example.com', 'user2@example.com'],
	'System maintenance notice',
	{ priority: MessagePriority.URGENT }
);
```

### Health Monitoring

```typescript
// Check service health
const health = await messagingService.healthCheck();
console.log('Redis:', health.redis);
console.log('Email:', health.email);
console.log('SMS:', health.sms);

// Get statistics
const stats = await messagingService.getMessageStats();
console.log('Total messages:', stats.totalMessages);
```

## Configuration

### Environment Variables

```env
# SMS Configuration (Infobip)
INFOBIP_API_BASE_URL=https://e1wzeq.api.infobip.com/sms/2/text/advanced
INFOBIP_API_KEY=your_infobip_secret_key

# Email Configuration (Gmail)
SENDER_EMAIL=your_email@gmail.com
APP_PASSWORD=your_app_password

# Redis Configuration (defaults to localhost:6379)
# Configure in messaging service if needed
```

### OTP Configuration

```typescript
// Default OTP settings (configurable)
const OTP_EXPIRY_TIME = 300; // 5 minutes
const OTP_LENGTH = 6; // 6 digits
```

## Error Handling

The service includes comprehensive error handling:

- **Network failures**: Automatic retry logic
- **Invalid recipients**: Validation before sending
- **Service unavailability**: Graceful degradation
- **Rate limiting**: Built-in protection
- **Timeout handling**: Configurable timeouts

## Security Features

- **OTP expiration**: Automatic cleanup after verification
- **Rate limiting**: Prevents abuse
- **Input validation**: Zod schema validation
- **Error sanitization**: No sensitive data in error messages
- **Redis security**: Connection isolation

## Performance Optimizations

- **Connection pooling**: Redis and SMTP connections
- **Bulk operations**: Efficient batch processing
- **Async operations**: Non-blocking message sending
- **Caching**: OTP storage optimization
- **Health checks**: Proactive monitoring

## Monitoring & Logging

- **Structured logging**: JSON format with context
- **Performance metrics**: Response times and success rates
- **Error tracking**: Detailed error information
- **Health monitoring**: Service availability checks
- **Statistics**: Message delivery analytics

## Migration Guide

### From Old Services

The new messaging service replaces these old services:

- `src/services/redis.ts`
- `src/services/sms.ts`
- `src/services/email.ts`
- `src/services/otp.ts`
- `src/utils/startEmailVerification.ts`
- `src/utils/startPhoneVerification.ts`
- `src/utils/verifyEmailOTP.ts`

### Update Imports

```typescript
// Old imports
import { getOTP, expireOTP } from '../services/otp';
import sendOTP from '../services/sms';
import { sendMail } from '../services/email';

// New imports
import { messagingService } from '../services/messaging';
```

### Update Method Calls

```typescript
// Old way
const otp = await getOTP(email);
await expireOTP(email);
await sendOTP(phone, otp);
await sendMail(email, html, subject, text);

// New way
const otp = await messagingService.getOTP(email);
await messagingService.expireOTP(email);
await messagingService.sendOTPViaSMS(phone);
await messagingService.sendNotification(email, message, { channel: ChannelType.EMAIL });
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**

   - Check Redis server is running
   - Verify connection settings
   - Check firewall rules

2. **SMS Not Sending**

   - Verify Infobip credentials
   - Check phone number format
   - Review API quotas

3. **Email Not Sending**

   - Verify Gmail app password
   - Check SMTP settings
   - Review sender email configuration

4. **OTP Verification Fails**
   - Check OTP expiry time
   - Verify Redis connection
   - Review OTP generation logic

### Debug Mode

Enable debug logging by setting the log level in your logger configuration.

## Future Enhancements

- [ ] Message templates with variables
- [ ] Scheduled messaging
- [ ] Message queuing for high volume
- [ ] Webhook notifications
- [ ] Message history and analytics
- [ ] Multi-provider support
- [ ] A/B testing for message content
- [ ] Message personalization
- [ ] Delivery receipts
- [ ] Message encryption
