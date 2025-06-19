# Server Improvements Documentation

## Overview

This document outlines the comprehensive improvements made to `server.ts` and `router.ts` files to enhance security, performance, maintainability, and developer experience.

## 🚀 Server.ts Improvements

### 1. **Object-Oriented Architecture**

- **Class-based design**: Converted from procedural to object-oriented approach using the `App` class
- **Encapsulation**: All server logic is now properly encapsulated within the class
- **Better separation of concerns**: Each initialization method has a specific responsibility

### 2. **Enhanced Security**

- **Trust proxy configuration**: Set to `1` for proper IP handling behind proxies
- **X-Powered-By removal**: Disabled to prevent information disclosure
- **Compression security**: Added filter to prevent compression attacks
- **Request size limits**: Set JSON and URL-encoded body limits to 10MB

### 3. **Performance Optimizations**

- **Compression middleware**: Added gzip compression with configurable levels
- **Static file caching**: Implemented ETags and max-age for static assets
- **Request timing**: Added response time tracking and logging
- **Memory management**: Better handling of server resources

### 4. **Improved Error Handling**

- **Enhanced unhandled rejection handling**: Better logging with timestamps and environment-specific behavior
- **Graceful shutdown improvements**: Added shutdown state tracking to prevent multiple shutdown attempts
- **Better error context**: More detailed error information in logs
- **Production vs development**: Different error handling strategies based on environment

### 5. **Process Management**

- **Multiple signal handling**: Support for SIGTERM, SIGINT, and SIGUSR2
- **Ordered shutdown**: Proper sequence of closing server, cron jobs, and database connections
- **Timeout protection**: Force exit after 10 seconds if graceful shutdown fails
- **Resource cleanup**: Ensures all resources are properly released

### 6. **Better Logging**

- **Structured logging**: Consistent log format with timestamps
- **Request tracking**: Logs request method, URL, status code, and duration
- **Environment information**: Clear startup messages with server details
- **Error categorization**: Better error classification and reporting

## 🔧 Router.ts Improvements

### 1. **Enhanced Security Configuration**

- **Dynamic CORS**: Environment-aware CORS configuration with proper origin validation
- **Helmet configuration**: Customized Content Security Policy and security headers
- **Rate limiting**: Multiple rate limit tiers for different endpoint types
- **Request validation**: Better input validation and sanitization

### 2. **Rate Limiting Strategy**

- **Tiered rate limits**:
  - General endpoints: 100 requests per 15 minutes
  - Authentication endpoints: 5 requests per 15 minutes (stricter)
  - API endpoints: 1000 requests per 15 minutes
- **Custom key generation**: Uses IP address or forwarded headers
- **Detailed rate limit responses**: Includes retry-after information
- **Rate limit logging**: Logs when limits are exceeded

### 3. **Request Tracking & Monitoring**

- **Request ID middleware**: Generates unique request IDs for tracking
- **Response time headers**: Adds X-Response-Time header to all responses
- **Structured request logging**: Logs method, URL, status, duration, and user agent
- **Performance monitoring**: Tracks response times and request patterns

### 4. **Enhanced Health Check**

- **Comprehensive health status**: Includes database, server, and service health
- **Performance metrics**: Memory usage, CPU usage, and response times
- **Environment information**: Version, uptime, and environment details
- **Request correlation**: Includes request ID in health check responses

### 5. **API Documentation**

- **Auto-generated docs endpoint**: `/api/v1/docs` provides API overview
- **Endpoint listing**: Shows all available API endpoints
- **Version information**: Displays API version and timestamp
- **Request correlation**: Includes request ID for debugging

### 6. **Better Error Handling**

- **404 handler**: Custom 404 responses with helpful suggestions
- **Request correlation**: All error responses include request ID
- **Structured error responses**: Consistent error format across all endpoints
- **Helpful suggestions**: Provides guidance when routes are not found

### 7. **Middleware Organization**

- **Logical grouping**: Middlewares are organized by function
- **Clear documentation**: Each middleware has clear purpose and configuration
- **Environment awareness**: Different configurations for development and production
- **Performance considerations**: Optimized middleware order for better performance

## 🛡️ Security Enhancements

### CORS Configuration

```typescript
const corsOptions = {
	origin: (origin, callback) => {
		// Dynamic origin validation based on environment
		const allowedOrigins = [
			'http://localhost:3000',
			'http://localhost:3001',
			// Production origins added conditionally
		];

		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			logger.warn(`CORS blocked request from origin: ${origin}`);
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
	exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
	maxAge: 86400, // 24 hours
};
```

### Rate Limiting

```typescript
const createRateLimiter = (windowMs: number, max: number, message?: string) => {
	return rateLimit({
		windowMs,
		max,
		message: {
			error: message || 'Too many requests from this IP, please try again later.',
			retryAfter: Math.ceil(windowMs / 1000),
		},
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: (req) => {
			return (
				(req.headers['x-forwarded-for'] as string) ||
				req.ip ||
				req.connection.remoteAddress ||
				'unknown'
			);
		},
		handler: (req, res) => {
			logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
			res.status(StatusCodes.TOO_MANY_REQUESTS).json({
				error: 'Too many requests',
				retryAfter: Math.ceil(windowMs / 1000),
				timestamp: new Date().toISOString(),
			});
		},
	});
};
```

## 📊 Monitoring & Observability

### Request Tracking

- **Unique request IDs**: Generated for each request for correlation
- **Response time tracking**: Measures and logs request duration
- **Structured logging**: Consistent log format for better analysis
- **Performance metrics**: Memory and CPU usage monitoring

### Health Monitoring

- **Database health checks**: Verifies database connectivity and performance
- **Service status**: Monitors all critical services
- **Performance metrics**: Tracks response times and resource usage
- **Environment information**: Provides context for debugging

## 🔄 Migration Guide

### Before (Old Structure)

```typescript
// Procedural approach
const app = express();
app.use(express.static('public'));
app.use(router);

const server = app.listen(envars.PORT, async () => {
	// Startup logic mixed with server creation
});
```

### After (New Structure)

```typescript
// Object-oriented approach
class App {
	private app: Application;
	private server: HTTPServer;

	constructor() {
		this.app = express();
		this.server = createServer(this.app);
		this.initializeMiddlewares();
		this.initializeRoutes();
		this.initializeErrorHandling();
		this.initializeProcessHandlers();
	}

	public async start(): Promise<void> {
		// Clean startup sequence
	}
}

const app = new App();
app.start();
```

## 🚀 Getting Started

### 1. Environment Setup

Ensure your environment variables are properly configured:

```bash
NODE_ENV=development
PORT=3000
# ... other required environment variables
```

### 2. Start the Server

```bash
npm run build
npm start
```

### 3. Verify Installation

- Health check: `GET /health`
- API docs: `GET /api/v1/docs`
- Privacy policy: `GET /privacy`

## 📈 Performance Benefits

1. **Compression**: Reduces response sizes by 60-80%
2. **Caching**: Static files cached for 24 hours
3. **Rate limiting**: Prevents abuse and improves stability
4. **Request tracking**: Better debugging and monitoring
5. **Graceful shutdown**: Prevents data loss and corruption

## 🔒 Security Benefits

1. **CORS protection**: Prevents unauthorized cross-origin requests
2. **Rate limiting**: Prevents brute force and DDoS attacks
3. **Security headers**: Protects against common web vulnerabilities
4. **Input validation**: Prevents injection attacks
5. **Request tracking**: Better audit trail for security incidents

## 🛠️ Maintenance Benefits

1. **Modular design**: Easy to modify and extend
2. **Clear separation**: Each component has a single responsibility
3. **Comprehensive logging**: Better debugging and monitoring
4. **Environment awareness**: Different configurations for different environments
5. **Documentation**: Clear API documentation and usage examples

## 🔮 Future Enhancements

1. **WebSocket support**: Add real-time communication capabilities
2. **API versioning**: Support for multiple API versions
3. **Caching layer**: Redis integration for better performance
4. **Metrics collection**: Prometheus/Grafana integration
5. **Load balancing**: Support for horizontal scaling

## 📝 Notes

- All improvements are backward compatible
- No breaking changes to existing API endpoints
- Enhanced security without affecting functionality
- Better performance with minimal configuration changes
- Comprehensive logging for better debugging and monitoring

## Payment-to-Appointment Linking & Transaction Processing Improvements

### 1. Robust Validation

- When a patient initiates a payment, the system now validates that the appointment exists and belongs to the patient.
- Prevents duplicate successful payments for the same appointment (no double payment).

### 2. Two-Way Linking

- Payments are linked to appointments via the `appointment` field in the Payment model.
- Appointments now have a `payments` array (ObjectId references to Payment) for reverse lookup.

### 3. Payment Status Tracking

- Appointments have a `paymentStatus` field (`'UNPAID' | 'PENDING' | 'PAID' | 'FAILED'`).
- When a payment is initiated, the appointment's `paymentStatus` is set to `'PENDING'`.
- When a payment is marked as `SUCCESSFUL`, the appointment's `paymentStatus` is set to `'PAID'`.
- If a payment fails, the appointment's `paymentStatus` is set to `'FAILED'`.

### 4. Status Update Logic

- Payment status checks now support both MTN and Airtel providers.
- On status check, the payment and appointment are updated accordingly.

### 5. API Changes

- Payment initiation endpoint now enforces all the above checks and updates.
- Status check endpoint updates both payment and appointment records.

These changes ensure accurate, robust, and auditable payment processing for appointments.

## DTOs and Model Consistency

- All DTOs (request/response schemas) now match the database models for patient, nurse, admin, and appointment entities.
- Location fields use GeoJSON format consistently.
- All create/update APIs expect/request the same fields as the models.
- This improves data consistency and reduces errors between API and database layers.
