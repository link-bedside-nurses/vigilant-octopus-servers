# Payment System Migration Guide

## Overview

This guide documents the migration from the old MTN MoMo/Airtel Money direct integration to the new unified MarzPay payment gateway.

## What Changed

### Old System
- Direct integration with MTN MoMo API
- Direct integration with Airtel Money API
- Separate service classes for each provider
- Manual provider detection and switching
- Complex authentication flows for each provider

### New System
- Unified MarzPay API gateway
- Single service for both MTN and Airtel
- Automatic provider detection
- Simplified authentication (Basic Auth)
- Webhook-based status updates
- Better error handling and logging

## Breaking Changes

### 1. Payment Model Schema

**Old Schema:**
```typescript
{
  appointment: ObjectId,
  patient: ObjectId,
  amount: number,
  referenceId: string,
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED',
  paymentMethod: 'MTN' | 'AIRTEL',
  transactionId?: string,
  failureReason?: string,
  comment: string
}
```

**New Schema:**
```typescript
{
  appointment: ObjectId,
  patient: ObjectId,
  amount: number,
  amountFormatted?: string,
  currency?: string,
  reference: string,                  // Changed from referenceId
  externalUuid?: string,              // New: MarzPay transaction ID
  providerReference?: string,         // New: Provider's reference
  phoneNumber?: string,               // New: Customer phone
  paymentMethod: 'MTN' | 'AIRTEL',
  status: PaymentStatus,              // Expanded enum
  description?: string,               // Changed from comment
  callbackUrl?: string,               // New
  country?: string,                   // New
  mode?: string,                      // New: live/sandbox
  initiatedAt?: Date,                 // New
  estimatedSettlement?: Date,         // New
  completedAt?: Date,                 // New
  transactionId?: string,
  failureReason?: string,
  apiResponse?: any,                  // New
  webhookData?: any,                  // New
  webhookAttempts?: number,           // New
}
```

### 2. Payment Status Enum

**Old:**
```typescript
'PENDING' | 'SUCCESSFUL' | 'FAILED'
```

**New:**
```typescript
enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  SANDBOX = 'SANDBOX',
}
```

### 3. API Endpoints

#### Initiate Payment

**Old:**
```
POST /api/v1/payments/patient/:id/initiate
Body: {
  amount: number,
  appointment: string,
  message?: string,
  provider?: 'MTN' | 'AIRTEL'
}
```

**New:**
```
POST /api/v1/payments/patient/:id/initiate
Body: {
  amount: number,
  appointmentId: string,           // Changed from appointment
  description?: string,            // Changed from message
  phoneNumber?: string             // New: optional, uses patient's phone if not provided
}
```

#### Check Payment Status

**Old:**
```
GET /api/v1/payments/:id/status
Returns: { payment, status: { status, financialTransactionId } }
```

**New:**
```
GET /api/v1/payments/:id/status
Returns: Updated payment object with refreshed status from MarzPay API
```

### 4. Service Classes

**Removed:**
- `MomoAuthService`
- `MomoCollectionsService`
- `AirtelCollectionsService`
- `AirtelAuthService`
- All files in `src/payments/momo/`
- All files in `src/payments/airtel/`

**Added:**
- `MarzPayService` - Core MarzPay API integration
- `CollectionService` - Business logic for payment collections
- `WebhookService` - Webhook processing

### 5. Environment Variables

**Removed/Made Optional:**
```env
MOMO_CALLBACK_HOST
X_REFERENCE_ID
API_KEY
OCP_APIM_SUBSCRIPTION_KEY
AIRTEL_MONEY_CLIENT_ID
AIRTEL_MONEY_CLIENT_SECRET_KEY
```

**Added (Required):**
```env
MARZ_PAY_BASE_URL=https://wallet.wearemarz.com/api/v1
MARZ_PAY_API_KEY=your_api_key
MARZ_PAY_API_SECRET=your_api_secret
APP_URL=https://your-domain.com
```

## Migration Steps

### Step 1: Update Environment Variables

1. Obtain MarzPay API credentials from MarzPay dashboard
2. Add new environment variables to your `.env` file:

```env
# MarzPay Payment Gateway
MARZ_PAY_BASE_URL=https://wallet.wearemarz.com/api/v1
MARZ_PAY_API_KEY=your_api_key_here
MARZ_PAY_API_SECRET=your_api_secret_here
APP_URL=https://your-domain.com
```

3. Legacy payment provider credentials are now optional and can be removed

### Step 2: Database Migration

**IMPORTANT:** The payment schema has changed. Existing payment records will continue to work, but new fields will be null.

**Option A: Keep Old Payments As-Is (Recommended)**
- Old payment records remain unchanged
- New payments use new schema
- Both can coexist in the same collection

**Option B: Migrate Old Payments**
If you want to normalize old payments, run this MongoDB script:

```javascript
db.payments.updateMany(
  { reference: { $exists: false } },
  [
    {
      $set: {
        reference: "$referenceId",
        description: "$comment",
        currency: "UGX",
        country: "UG",
        mode: "live",
        webhookAttempts: 0
      }
    },
    {
      $unset: ["referenceId", "comment"]
    }
  ]
);
```

### Step 3: Update Client Applications

If you have mobile apps or frontend applications consuming the API:

1. **Update Payment Initiation Request:**
   ```diff
   - appointment: appointmentId
   + appointmentId: appointmentId
   
   - message: "Payment for appointment"
   + description: "Payment for appointment"
   
   - provider: "MTN"  // This is now auto-detected
   ```

2. **Update Payment Status Response Handling:**
   - Old: `payment.status` was 'PENDING' | 'SUCCESSFUL' | 'FAILED'
   - New: Also includes 'PROCESSING', 'CANCELLED', 'SANDBOX'
   
3. **Handle New Payment Flow:**
   - Payments now go through PENDING → PROCESSING → SUCCESSFUL/FAILED
   - Display appropriate UI for PROCESSING state

### Step 4: Update Webhook Configuration

1. Configure webhook URL in MarzPay dashboard:
   ```
   https://your-domain.com/api/v1/payments/webhooks/collection
   ```

2. Ensure your server can receive webhooks from MarzPay's IPs
   - Update firewall rules if necessary
   - Webhook endpoint is public (no authentication required)

### Step 5: Testing

1. **Test in Sandbox Mode:**
   - Use sandbox credentials from MarzPay
   - Test with sandbox phone numbers
   - Verify webhook delivery

2. **Test Payment Flow:**
   ```bash
   # Initiate payment
   curl -X POST http://localhost:3000/api/v1/payments/patient/{patientId}/initiate \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 5000,
       "appointmentId": "{appointmentId}",
       "description": "Test payment"
     }'
   
   # Check status
   curl http://localhost:3000/api/v1/payments/{paymentId}/status \
     -H "Authorization: Bearer {token}"
   ```

3. **Verify Provider Detection:**
   ```bash
   # Test MTN number
   curl http://localhost:3000/api/v1/payments/detect-provider/+256771234567
   
   # Test Airtel number
   curl http://localhost:3000/api/v1/payments/detect-provider/+256701234567
   ```

### Step 6: Deploy

1. **Deploy to Staging:**
   - Test with real credentials in staging
   - Monitor logs for any errors
   - Verify webhook delivery

2. **Deploy to Production:**
   - Schedule deployment during low-traffic period
   - Monitor payment success rate
   - Keep rollback plan ready

3. **Monitor:**
   - Payment success rate
   - Webhook delivery success
   - API response times
   - Error logs

## Code Migration Examples

### Old Code (Payment Initiation)

```typescript
// Old way
const provider = detectProvider(patient.phone);
let referenceId: string;

if (provider === 'MTN') {
  const momoService = MomoCollectionsService.getInstance();
  referenceId = await momoService.requestToPay(
    amount.toString(),
    patient.phone,
    'Payment for appointment'
  );
} else {
  const airtelService = AirtelCollectionsService.getInstance();
  referenceId = await airtelService.requestToPay(amount, patient.phone);
}

const payment = await db.payments.create({
  patient: patient.id,
  amount: amount,
  appointment: appointmentId,
  comment: 'Payment for appointment',
  referenceId: referenceId,
  status: 'PENDING',
  paymentMethod: provider,
});
```

### New Code (Payment Initiation)

```typescript
// New way - much simpler!
const collectionService = new CollectionService();

const payment = await collectionService.createCollection({
  amount: amount,
  phoneNumber: patient.phone,
  appointmentId: appointmentId,
  patientId: patient.id,
  description: 'Payment for appointment',
});

// Provider is automatically detected
// Appointment is automatically updated
// Webhook will handle status updates
```

### Old Code (Status Check)

```typescript
// Old way
let statusResult;
if (payment.paymentMethod === 'MTN') {
  const momoService = MomoCollectionsService.getInstance();
  statusResult = await momoService.getTransactionStatus(payment.referenceId);
  payment.status = statusResult.status;
  payment.transactionId = statusResult.financialTransactionId;
} else {
  const airtelService = AirtelCollectionsService.getInstance();
  statusResult = await airtelService.getTransactionStatus(payment.referenceId);
  payment.status = statusResult.status;
  payment.transactionId = statusResult.transactionId;
}
await payment.save();
```

### New Code (Status Check)

```typescript
// New way
const collectionService = new CollectionService();
const updatedPayment = await collectionService.refreshStatus(paymentId);

// Status is automatically refreshed from MarzPay
// Appointment status is automatically updated if payment succeeded
```

## New Features

### 1. Automatic Provider Detection
The system automatically detects MTN or Airtel from the phone number:
- MTN: 076x, 077x, 078x, 031x, 039x
- Airtel: 070x-075x

### 2. Phone Number Formatting
Phone numbers are automatically formatted to international format:
- Input: `0771234567` → Output: `+256771234567`
- Input: `256771234567` → Output: `+256771234567`

### 3. Payment Statistics
New endpoint for analytics:
```bash
GET /api/v1/payments/statistics?patientId={id}
```
Returns:
```json
{
  "total": 10,
  "successful": 8,
  "pending": 1,
  "failed": 1,
  "totalAmount": 500000,
  "successfulAmount": 400000
}
```

### 4. Payment Reference Generation
UUID v4 references ensure uniqueness:
```bash
GET /api/v1/payments/generate-reference
```

### 5. Enhanced Error Handling
More descriptive error messages and proper HTTP status codes

### 6. Webhook-Based Updates
Real-time status updates without polling

## Rollback Plan

If you need to rollback to the old system:

1. **Keep Old Code:**
   - Tag the commit before migration: `git tag pre-marzpay-migration`
   - Old code remains in git history

2. **Revert Environment Variables:**
   ```bash
   git checkout pre-marzpay-migration -- .env.example
   ```

3. **Revert Code:**
   ```bash
   git revert {migration-commit-sha}
   ```

4. **Database:**
   - Old payment records continue to work
   - Stop using new endpoints

## Support

### Common Issues

**Issue: "Payment gateway error"**
- Check MarzPay API credentials
- Verify API key and secret are correct
- Check MarzPay service status

**Issue: "Invalid phone number format"**
- Ensure phone number starts with +256 or 256 or 0
- Must be Uganda phone number (7x or 3x)

**Issue: "Unable to detect mobile money provider"**
- Verify phone number prefix is valid MTN or Airtel
- Check for typos in phone number

**Issue: "Webhooks not received"**
- Verify APP_URL is publicly accessible
- Check firewall settings
- Review webhook logs in MarzPay dashboard

### Getting Help

1. **MarzPay API Issues:**
   - Documentation: https://wallet.wearemarz.com/docs
   - Support: support@wearemarz.com

2. **Integration Issues:**
   - Check application logs
   - Review `src/payments/README.md`
   - Contact development team

## Checklist

- [ ] MarzPay account created and credentials obtained
- [ ] Environment variables updated
- [ ] Database backup created
- [ ] Tested in sandbox/staging environment
- [ ] Webhook URL configured in MarzPay dashboard
- [ ] Client applications updated
- [ ] Monitoring and alerts configured
- [ ] Team trained on new system
- [ ] Documentation updated
- [ ] Rollback plan prepared

## Benefits of New System

1. **Simplified Integration:** One API for both providers
2. **Better Error Handling:** More descriptive errors with proper codes
3. **Automatic Updates:** Webhooks provide real-time status updates
4. **Reduced Complexity:** Less code to maintain
5. **Better Logging:** Comprehensive logging at all stages
6. **Provider Agnostic:** Easy to add new providers through MarzPay
7. **Improved UX:** Better payment flow and status tracking
8. **Cost Effective:** Unified gateway reduces integration costs
9. **Better Support:** Professional support from MarzPay team
10. **Future Ready:** Easy to scale and add new features

## Timeline

Recommended migration timeline:

- **Week 1:** Setup and Testing
  - Obtain credentials
  - Update environment
  - Test in sandbox

- **Week 2:** Staging Deployment
  - Deploy to staging
  - Test with real credentials
  - Monitor for issues

- **Week 3:** Production Deployment
  - Deploy to production
  - Monitor closely
  - Provide support

- **Week 4+:** Monitoring and Optimization
  - Review analytics
  - Optimize based on data
  - Gather user feedback