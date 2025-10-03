import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
// import responseTime from 'response-time';

import morgan from 'morgan';
import responseTime from 'response-time';
import envars from './config/env-vars';
import { db, healthCheck } from './database';
import errorMiddleware from './middlewares/error-middleware';
import accountDeletionRouter from './modules/account-deletion.controller';
import adminRouter from './modules/admins.controller';
import appointmentRouter from './modules/appointments.controller';
import authRouter from './modules/auth.controller';
import dashboardRouter from './modules/dashboard.controller';
import emailRouter from './modules/email.controller';
import messagingRouter from './modules/messaging.controller';
import nurseRouter from './modules/nurses.controller';
import patientRouter from './modules/patients.controller';
import paymentsRouter from './modules/payments.controller';
import streamingRouter from './modules/streaming.controller';
import { sendNormalized } from './utils/http-response';
import logger from './utils/logger';
import { privacy } from './utils/privacy';

const router = express.Router();

/**
 * Security and CORS Configuration
 */
const corsOptions = {
	origin: ( origin: string | undefined, callback: ( err: Error | null, allow?: boolean ) => void ) => {
		// Allow requests with no origin (like mobile apps or curl requests)
		if ( !origin ) return callback( null, true );

		const allowedOrigins = [
			'http://localhost:3000',
			'http://localhost:3001',
			'http://127.0.0.1:3000',
			'http://127.0.0.1:3001',
			'http://127.0.0.1:8080',
			'http://127.0.0.1:8081',
			'https://linkbedsides.ianbalijawa.com',
		];

		// Add production origins here
		if ( envars.NODE_ENV === 'production' ) {
			allowedOrigins.push(
				'https://linkbedsides.ianbalijawa.com',
				'https://www.linkbedsides.ianbalijawa.com'
			);
		}

		if ( allowedOrigins.includes( origin ) ) {
			callback( null, true );
		} else {
			logger.warn( `CORS blocked request from origin: ${origin}` );
			callback( new Error( 'Not allowed by CORS' ) );
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
	exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
	maxAge: 86400, // 24 hours
};

/**
 * Rate Limiting Configuration
 */
const createRateLimiter = ( windowMs: number, max: number, message?: string ) => {
	return rateLimit( {
		windowMs,
		max,
		message: {
			error: message || 'Too many requests from this IP, please try again later.',
			retryAfter: Math.ceil( windowMs / 1000 ),
		},
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: ( req ) => {
			// Use IP address or user ID if available
			return (
				( req.headers['x-forwarded-for'] as string ) ||
				req.ip ||
				req.socket.remoteAddress ||
				'unknown'
			);
		},
		handler: ( req, res ) => {
			logger.warn( `Rate limit exceeded for IP: ${req.ip}` );
			res.status( StatusCodes.TOO_MANY_REQUESTS ).json( {
				error: 'Too many requests',
				retryAfter: Math.ceil( windowMs / 1000 ),
				timestamp: new Date().toISOString(),
			} );
		},
	} );
};

// Different rate limits for different endpoints
const generalLimiter = createRateLimiter( 15 * 60 * 1000, 100 ); // 100 requests per 15 minutes
const authLimiter = createRateLimiter( 15 * 60 * 1000, 50 ); // 50 requests per 15 minutes for auth
const apiLimiter = createRateLimiter( 15 * 60 * 1000, 1000 ); // 1000 requests per 15 minutes for API

/**
 * Request ID Middleware
 */
const requestIdMiddleware = ( req: Request, res: Response, next: NextFunction ) => {
	const requestId =
		( req.headers['x-request-id'] as string ) ||
		`req_${Date.now()}_${Math.random().toString( 36 ).substring( 2, 9 )}`;
	req.headers['x-request-id'] = requestId;
	res.setHeader( 'X-Request-ID', requestId );
	next();
};

/**
 * Initialize Middlewares
 */
router.use(
	helmet( {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'"],
				imgSrc: ["'self'", 'data:', 'https:'],
			},
		},
		crossOriginEmbedderPolicy: false,
	} )
);

router.use( cors( corsOptions ) );
router.use( requestIdMiddleware );
router.use( responseTime() );

// Morgan logging with custom format
router.use(
	morgan( 'dev', {
		stream: {
			write: ( message: string ) => logger.info( message.trim() ),
		},
	} )
);

const API_PREFIX = '/api/v1';

/**
 * Health Check Endpoint
 */
router.get( `${API_PREFIX}/health`, async ( req: Request, res: Response ) => {
	try {
		const startTime = Date.now();
		const dbHealth = await healthCheck();

		// Check Redis health
		let redisHealth: { status: string; error?: string } = {
			status: 'unknown',
			error: 'Redis not initialized',
		};
		try {
			if ( ( global as any ).redis ) {
				await ( global as any ).redis.ping();
				redisHealth = { status: 'healthy' };
			}
		} catch ( error ) {
			redisHealth = {
				status: 'unhealthy',
				error: error instanceof Error ? error.message : 'Unknown Redis error',
			};
		}

		const responseTime = Date.now() - startTime;

		const healthStatus = {
			status:
				dbHealth.status === 'healthy' && redisHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: envars.NODE_ENV,
			version: process.env.npm_package_version || '1.0.0',
			responseTime: `${responseTime}ms`,
			services: {
				database: dbHealth,
				redis: redisHealth,
				server: {
					status: 'healthy',
					memory: process.memoryUsage(),
					cpu: process.cpuUsage(),
					resources: process.resourceUsage(),
				},
			},
			requestId: req.headers['x-request-id'],
		};

		const statusCode =
			healthStatus.status === 'healthy' ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
		return sendNormalized( res, statusCode, healthStatus, 'Fetched server health' );
	} catch ( error ) {
		logger.error( 'Health check failed:', error );
		return sendNormalized(
			res,
			StatusCodes.SERVICE_UNAVAILABLE,
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : 'Unknown error',
				requestId: req.headers['x-request-id'],
			},
			'System unhealthy'
		);
	}
} );

/**
 * Privacy Policy Endpoint
 */
router.get( '/privacy', ( req: Request, res: Response ) => {
	res.setHeader( 'Content-Type', 'text/html' );
	res.send( privacy );
} );

/**
 * API Documentation Endpoint
 */
router.get( `${API_PREFIX}/docs`, ( req: Request, res: Response ) => {
	res.json( {
		message: 'API Documentation',
		version: '1.0.0',
		endpoints: {
			auth: `${API_PREFIX}/auth`,
			appointments: `${API_PREFIX}/appointments`,
			nurses: `${API_PREFIX}/nurses`,
			patients: `${API_PREFIX}/patients`,
			payments: `${API_PREFIX}/payments`,
			admins: `${API_PREFIX}/admins`,
			email: `${API_PREFIX}/email`,
			messaging: `${API_PREFIX}/messaging`,
			dashboard: `${API_PREFIX}/dashboard`,
		},
		health: '/health',
		privacy: '/privacy',
		timestamp: new Date().toISOString(),
		requestId: req.headers['x-request-id'],
	} );
} );

/**
 * Account Deletion Routes (Public)
 */
router.use( '/account-deletion', generalLimiter, accountDeletionRouter );

/**
 * API Routes with Versioning
 */

// Apply rate limiting to API routes
router.use( API_PREFIX, apiLimiter );

// Auth routes with stricter rate limiting
router.use( `${API_PREFIX}/auth`, authLimiter, authRouter );

// Protected API routes
router.use( `${API_PREFIX}/appointments`, appointmentRouter );
router.use( `${API_PREFIX}/nurses`, nurseRouter );
router.use( `${API_PREFIX}/patients`, patientRouter );
router.use( `${API_PREFIX}/payments`, paymentsRouter );
router.use( `${API_PREFIX}/admins`, adminRouter );
router.use( `${API_PREFIX}/email`, emailRouter );
router.use( `${API_PREFIX}/messaging`, messagingRouter );
router.use( `${API_PREFIX}/dashboard`, dashboardRouter );
router.use( `${API_PREFIX}/stream`, streamingRouter );

/**
 * Dashboard Stats Endpoint
 */
router.get( `${API_PREFIX}/dashboard/stats`, async ( req, res, next ) => {
	try {
		const [
			totalPatients,
			totalNurses,
			totalAppointments,
			totalPayments,
			completedAppointments,
			pendingAppointments,
			verifiedNurses,
			unverifiedNurses,
			totalRevenueAgg,
		] = await Promise.all( [
			db.patients.countDocuments(),
			db.nurses.countDocuments(),
			db.appointments.countDocuments(),
			db.payments.countDocuments(),
			db.appointments.countDocuments( { status: 'completed' } ),
			db.appointments.countDocuments( { status: 'pending' } ),
			db.nurses.countDocuments( { isVerified: true } ),
			db.nurses.countDocuments( { isVerified: false } ),
			db.payments.aggregate( [
				{ $match: { status: 'SUCCESSFUL' } },
				{ $group: { _id: null, total: { $sum: '$amount' } } },
			] ),
		] );

		const totalRevenue =
			Array.isArray( totalRevenueAgg ) && totalRevenueAgg[0] ? totalRevenueAgg[0].total : 0;

		const stats = {
			totalPatients,
			totalNurses,
			totalAppointments,
			totalPayments,
			completedAppointments,
			pendingAppointments,
			verifiedNurses,
			unverifiedNurses,
			totalRevenue,
		};

		return sendNormalized( res, StatusCodes.OK, stats, 'Stats retrieved' );
	} catch ( error ) {
		return next( error );
	}
} );

/**
 * Welcome Endpoint
 */
router.get( `/`, async ( req, res, next ) => {
	return sendNormalized( res, StatusCodes.OK, { message: 'Welcome to the LinkBedSides API' }, 'Welcome to the LinkBedSides API' );
} );

/**
 * 404 Handler
 */
router.use( '*', ( req: Request, res: Response ) => {
	logger.warn( `Route not found: ${req.method} ${req.originalUrl}` );
	res.status( StatusCodes.NOT_FOUND ).json( {
		error: 'Route not found',
		message: `Cannot ${req.method} ${req.originalUrl}`,
		timestamp: new Date().toISOString(),
		requestId: req.headers['x-request-id'],
		suggestions: [
			'Check the URL for typos',
			'Verify the HTTP method',
			'Consult the API documentation at /api/v1/docs',
		],
	} );
} );

/**
 * Error Handling Middleware (must be last)
 */
router.use( errorMiddleware );

export default router;
