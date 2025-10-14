# MarzPay Payment Integration

This directory contains the implementation of the MarzPay payment gateway integration for processing mobile money payments (MTN and Airtel) for patient appointments.

## Overview

The payment system allows patients to pay for appointments using MTN Mobile Money or Airtel Money. The integration uses the MarzPay API as a unified gateway for both providers.

## Architecture

### Services

1. **MarzPayService** (`marzpay.service.ts`)
   - Core service for interacting with the MarzPay API
   - Handles collection creation and status checks
   - Provider detection (MTN/Airtel) from phone numbers
   - Phone number formatting and validation
   - Singleton pattern for efficient resource usage

2. **CollectionService** (`collection.service.ts`)
   - Business logic for managing payment collections
   - Creates payment records in the database
   - Links payments to appointments and patients
   - Handles payment status updates from webhooks
   - Payment statistics and queries

3. **WebhookService** (`webhook.service.ts`)
   - Processes incoming webhooks from MarzPay
   - Updates payment and appointment statuses
   - Handles both collection and disbursement notifications

## Features

### Payment Initiation
- Generate unique UUID reference for each payment
- Validate payment amounts (500 - 10,000,000 UGX)
- Detect mobile money provider automatically
- Format phone numbers to international format (+256...)
- Prevent duplicate payments for same appointment
- Link payment to appointment and patient

### Status Management
- Real-time status updates via webhooks
- Manual status refresh from MarzPay API
- Status mapping: PENDING → PROCESSING → SUCCESSFUL/FAILED
- Automatic appointment payment status updates

### Payment Statuses
- **PENDING**: Payment initiated, waiting for customer action
- **PROCESSING**: Customer has approved, processing payment
- **SUCCESSFUL**: Payment completed successfully
- **FAILED**: Payment failed or was declined
- **CANCELLED**: Payment cancelled by user or system
- **SANDBOX**: Test mode payment

### Mobile Money Providers
- **MTN**: Prefixes 076, 077, 078, 031, 039
- **AIRTEL**: Prefixes 070-075

## API Endpoints

### Payment Operations

#### Initiate Payment
```
POST /api/v1/payments/patient/:patientId/initiate
```
**Body:**
```json
{
  "amount": 50000,
  "appointmentId": "64abc123...",
  "description": "Payment for appointment",
  "phoneNumber": "+256771234567" // Optional, uses patient's phone if not provided
}
```

#### Get Payment by ID
```
GET /api/v1/payments/:id
```

#### Get Payment by Reference
```
GET /api/v1/payments/reference/:reference
```

#### Check Payment Status
```
GET /api/v1/payments/:id/status
```
Refreshes status from MarzPay API and returns updated payment.

#### Cancel Payment
```
POST /api/v1/payments/:id/cancel
```
Cancels a pending or processing payment.

#### Get All Payments
```
GET /api/v1/payments
```
Query params: `status`, `paymentMethod`, `patientId`, `appointmentId`, `page`, `limit`

#### Get Payments by Patient
```
GET /api/v1/payments/patients/:patientId/payments
```

#### Get Payments by Appointment
```
GET /api/v1/payments/appointments/:appointmentId/payments
```

#### Get Nurse Earnings
```
GET /api/v1/payments/nurses/:nurseId/earnings
```

#### Get Payment Statistics
```
GET /api/v1/payments/statistics
```
Query params: `patientId`, `appointmentId`

#### Generate Reference
```
GET /api/v1/payments/generate-reference
```

#### Detect Provider
```
GET /api/v1/payments/detect-provider/:phoneNumber
```

### Webhook

#### Collection Webhook (Public - No Auth)
```
POST /api/v1/payments/webhooks/collection
```
Receives webhook notifications from MarzPay when payment status changes.

## Environment Variables

Add these to your `.env` file:

```env
# MarzPay Configuration
MARZ_PAY_BASE_URL=https://wallet.wearemarz.com/api/v1
MARZ_PAY_API_KEY=your_api_key_here
MARZ_PAY_API_SECRET=your_api_secret_here

# Application URL for webhooks
APP_URL=https://your-domain.com
```

## Database Schema

### Payment Model
```typescript
{
  appointment: ObjectId,        // Reference to Appointment
  patient: ObjectId,            // Reference to Patient
  amount: number,               // Amount in UGX
  amountFormatted: string,      // Formatted amount (e.g., "50,000.00")
  currency: string,             // "UGX"
  reference: string,            // Unique UUID reference (indexed)
  externalUuid: string,         // MarzPay transaction UUID
  providerReference: string,    // Provider's transaction reference
  phoneNumber: string,          // Customer phone number
  paymentMethod: enum,          // MTN | AIRTEL
  status: enum,                 // PENDING | PROCESSING | SUCCESSFUL | FAILED | CANCELLED | SANDBOX
  description: string,          // Payment description
  callbackUrl: string,          // Webhook callback URL
  country: string,              // "UG"
  mode: string,                 // "live" | "sandbox"
  initiatedAt: Date,            // When payment was initiated
  estimatedSettlement: Date,    // Estimated settlement time
  completedAt: Date,            // When payment was completed
  transactionId: string,        // Final transaction ID
  failureReason: string,        // Reason if failed
  apiResponse: object,          // Full API response
  webhookData: object,          // Webhook payload
  webhookAttempts: number,      // Number of webhook attempts
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Payment Fields
```typescript
{
  paymentStatus: enum,  // UNPAID | PENDING | PAID | FAILED
  payments: ObjectId[]  // Array of Payment references
}
```

## Webhook Flow

1. Patient initiates payment via `/payments/patient/:id/initiate`
2. System creates payment record with status PENDING
3. MarzPay sends prompt to customer's phone
4. Customer approves payment on their phone
5. MarzPay sends webhook to `/payments/webhooks/collection`
6. WebhookService processes webhook and updates payment status
7. If SUCCESSFUL, appointment paymentStatus is updated to PAID
8. If FAILED, appointment paymentStatus is updated to FAILED

## Error Handling

The system handles various error scenarios:

- **Invalid Amount**: Amount outside allowed range (500 - 10,000,000 UGX)
- **Invalid Phone**: Phone number format not recognized
- **Invalid Provider**: Cannot detect MTN or Airtel from phone number
- **Duplicate Payment**: Appointment already has successful payment
- **Appointment Not Found**: Invalid appointment ID
- **Patient Not Found**: Invalid patient ID
- **Payment Not Found**: Invalid payment ID
- **API Errors**: MarzPay API unavailable or returns error

## Usage Example

### Patient Payment Flow

```typescript
// 1. Patient initiates payment
const payment = await collectionService.createCollection({
  amount: 50000,
  phoneNumber: "+256771234567",
  appointmentId: "64abc123...",
  patientId: "64def456...",
  description: "Payment for medical appointment"
});

// 2. Patient receives mobile money prompt and approves

// 3. Webhook is received and processed automatically

// 4. Check payment status
const updatedPayment = await collectionService.refreshStatus(payment.id);

// 5. If successful, appointment is marked as PAID
```

### Provider Detection

```typescript
const marzPayService = MarzPayService.getInstance();

// Detect provider
const provider = marzPayService.detectProvider("+256771234567"); // Returns "mtn"

// Format phone number
const formatted = marzPayService.formatPhoneNumber("0771234567"); // Returns "+256771234567"

// Validate phone number
const isValid = marzPayService.validatePhoneNumber("+256771234567"); // Returns true
```

## Testing

### Sandbox Mode

MarzPay provides a sandbox mode for testing. Use sandbox credentials in your development environment.

### Test Phone Numbers

Check MarzPay documentation for test phone numbers that simulate various scenarios:
- Successful payment
- Failed payment
- Timeout
- Insufficient funds

## Security

1. **API Credentials**: Store in environment variables, never commit to repository
2. **Webhook Verification**: Validate webhook source (consider IP whitelisting)
3. **Authentication**: All payment endpoints require authentication except webhook
4. **Reference Uniqueness**: UUID v4 ensures no collision in payment references

## Monitoring

Key metrics to monitor:

- **Payment Success Rate**: Percentage of SUCCESSFUL payments
- **Average Processing Time**: Time from PENDING to final status
- **Failed Payments**: Track reasons for failures
- **Webhook Delivery**: Monitor webhook processing success
- **Provider Performance**: Compare MTN vs Airtel success rates

## Troubleshooting

### Payment Stuck in PENDING
- Check if customer received mobile money prompt
- Verify phone number is correct and active
- Use refresh status endpoint to get latest status from MarzPay

### Webhook Not Received
- Verify APP_URL is publicly accessible
- Check firewall/security group settings
- Review webhook logs in MarzPay dashboard

### Provider Detection Fails
- Ensure phone number is in correct format
- Verify number prefix matches supported providers
- Check for typos in phone number

## Future Enhancements

- [ ] Retry logic for failed payments
- [ ] Email/SMS notifications on payment status changes
- [ ] Payment refunds support
- [ ] Multiple payment methods per appointment
- [ ] Payment installments
- [ ] Payment receipts generation
- [ ] Admin dashboard for payment analytics
- [ ] Automated reconciliation with MarzPay

## Support

For MarzPay API issues:
- Documentation: https://wallet.wearemarz.com/docs
- Support: support@wearemarz.com

For integration issues:
- Check logs in `logger` service
- Review webhook payload in database
- Contact development team