import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import HTTPException from '../utils/exception';
import { normalizedResponse } from '../utils/http-response';
import logger from '../utils/logger';

// Error types for better categorization
export enum ErrorType {
	VALIDATION = 'VALIDATION_ERROR',
	DATABASE = 'DATABASE_ERROR',
	AUTHENTICATION = 'AUTHENTICATION_ERROR',
	AUTHORIZATION = 'AUTHORIZATION_ERROR',
	NOT_FOUND = 'NOT_FOUND_ERROR',
	CONFLICT = 'CONFLICT_ERROR',
	RATE_LIMIT = 'RATE_LIMIT_ERROR',
	EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
	INTERNAL = 'INTERNAL_SERVER_ERROR',
	NETWORK = 'NETWORK_ERROR',
	UNKNOWN = 'UNKNOWN_ERROR',
}

// Extended error interface
interface ExtendedError extends Error {
	statusCode?: number;
	code?: number | string;
	keyPattern?: { [key: string]: number };
	keyValue?: { [key: string]: unknown };
	kind?: string;
	errors?: { [key: string]: unknown }[];
	path?: string;
	value?: unknown;
	reason?: Error;
	stack?: string;
	isOperational?: boolean;
}

// Error response interface
interface ErrorResponse {
	statusCode: number;
	message: string;
	errorType: ErrorType;
	details?: string;
	timestamp: string;
	path?: string;
	requestId?: string;
}

/**
 * Handle MongoDB/Mongoose specific errors
 */
function handleMongoDBError(error: ExtendedError): {
	statusCode: number;
	message: string;
	errorType: ErrorType;
} {
	// Duplicate key error (E11000)
	if (error.code === 11000 && error.keyValue) {
		const key = Object.keys(error.keyValue)[0];
		const value = error.keyValue[key];
		return {
			statusCode: StatusCodes.CONFLICT,
			message: `${key.charAt(0).toUpperCase() + key.slice(1)} '${value}' is already taken`,
			errorType: ErrorType.CONFLICT,
		};
	}

	// Cast error (invalid ObjectId)
	if (error.name === 'CastError' && error.kind === 'ObjectId') {
		return {
			statusCode: StatusCodes.BAD_REQUEST,
			message: 'Invalid ID format provided',
			errorType: ErrorType.VALIDATION,
		};
	}

	// Validation error
	if (error.name === 'ValidationError' && error.errors) {
		const validationErrors = Object.values(error.errors).map((err: any) => err.message);
		return {
			statusCode: StatusCodes.BAD_REQUEST,
			message: `Validation failed: ${validationErrors.join(', ')}`,
			errorType: ErrorType.VALIDATION,
		};
	}

	// Mongoose connection errors
	if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
		return {
			statusCode: StatusCodes.SERVICE_UNAVAILABLE,
			message: 'Database connection error. Please try again later.',
			errorType: ErrorType.DATABASE,
		};
	}

	// Default MongoDB error
	return {
		statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		message: 'Database operation failed',
		errorType: ErrorType.DATABASE,
	};
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): {
	statusCode: number;
	message: string;
	errorType: ErrorType;
	details: string;
} {
	const issues = error.issues.map((issue) => {
		const path = issue.path.join('.');
		return `${path}: ${issue.message}`;
	});

	return {
		statusCode: StatusCodes.BAD_REQUEST,
		message: 'Validation failed',
		errorType: ErrorType.VALIDATION,
		details: issues.join('; '),
	};
}

/**
 * Handle HTTP exceptions
 */
function handleHTTPException(error: HTTPException): {
	statusCode: number;
	message: string;
	errorType: ErrorType;
} {
	return {
		statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		message: error.message,
		errorType:
			error.statusCode === StatusCodes.UNAUTHORIZED
				? ErrorType.AUTHENTICATION
				: error.statusCode === StatusCodes.FORBIDDEN
					? ErrorType.AUTHORIZATION
					: error.statusCode === StatusCodes.NOT_FOUND
						? ErrorType.NOT_FOUND
						: error.statusCode === StatusCodes.CONFLICT
							? ErrorType.CONFLICT
							: ErrorType.INTERNAL,
	};
}

/**
 * Handle rate limiting errors
 */
function handleRateLimitError(_error: ExtendedError): {
	statusCode: number;
	message: string;
	errorType: ErrorType;
} {
	return {
		statusCode: StatusCodes.TOO_MANY_REQUESTS,
		message: 'Too many requests. Please try again later.',
		errorType: ErrorType.RATE_LIMIT,
	};
}

/**
 * Handle external service errors (SMS, Email, etc.)
 */
function handleExternalServiceError(_error: ExtendedError): {
	statusCode: number;
	message: string;
	errorType: ErrorType;
} {
	return {
		statusCode: StatusCodes.SERVICE_UNAVAILABLE,
		message: 'External service temporarily unavailable. Please try again later.',
		errorType: ErrorType.EXTERNAL_SERVICE,
	};
}

/**
 * Handle network errors
 */
function handleNetworkError(_error: ExtendedError): {
	statusCode: number;
	message: string;
	errorType: ErrorType;
} {
	return {
		statusCode: StatusCodes.SERVICE_UNAVAILABLE,
		message: 'Network error. Please check your connection and try again.',
		errorType: ErrorType.NETWORK,
	};
}

/**
 * Handle unknown errors
 */
function handleUnknownError(error: ExtendedError): {
	statusCode: number;
	message: string;
	errorType: ErrorType;
} {
	// Log the full error for debugging
	logger.error('Unknown error occurred:', {
		name: error.name,
		message: error.message,
		stack: error.stack,
		code: error.code,
	});

	return {
		statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		message:
			process.env.NODE_ENV === 'production'
				? 'An unexpected error occurred. Please try again later.'
				: error.message,
		errorType: ErrorType.UNKNOWN,
	};
}

/**
 * Enhanced error middleware
 */
export default function errorMiddleware(
	error: ExtendedError,
	req: Request,
	res: Response,
	_next: NextFunction
): void {
	// Generate request ID for tracking
	const requestId =
		(req.headers['x-request-id'] as string) ||
		`req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

	// Log error with context
	logger.error('Error occurred:', {
		requestId,
		method: req.method,
		url: req.url,
		userAgent: req.get('User-Agent'),
		ip: req.ip,
		error: {
			name: error.name,
			message: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		},
	});

	let errorInfo: { statusCode: number; message: string; errorType: ErrorType; details?: string };

	// Categorize and handle different types of errors
	if (error instanceof ZodError) {
		errorInfo = handleZodError(error);
	} else if (error instanceof HTTPException) {
		errorInfo = handleHTTPException(error);
	} else if (
		error.name === 'MongoError' ||
		error.name === 'MongoNetworkError' ||
		error.name === 'MongoTimeoutError' ||
		error.name === 'ValidationError' ||
		error.name === 'CastError' ||
		error.code === 11000
	) {
		errorInfo = handleMongoDBError(error);
	} else if (
		error.message?.includes('rate limit') ||
		error.message?.includes('too many requests')
	) {
		errorInfo = handleRateLimitError(error);
	} else if (error.message?.includes('network') || error.message?.includes('connection')) {
		errorInfo = handleNetworkError(error);
	} else if (error.message?.includes('external') || error.message?.includes('service')) {
		errorInfo = handleExternalServiceError(error);
	} else {
		errorInfo = handleUnknownError(error);
	}

	// Create error response
	const errorResponse: ErrorResponse = {
		statusCode: errorInfo.statusCode,
		message: errorInfo.message,
		errorType: errorInfo.errorType,
		details: errorInfo.details,
		timestamp: new Date().toISOString(),
		path: req.path,
		requestId,
	};

	// Use the HTTP response utility for consistent formatting
	const httpResponse = normalizedResponse(
		errorInfo.statusCode as StatusCodes,
		null,
		errorInfo.message,
		error instanceof ZodError ? error : undefined
	);

	// Add additional error information in development
	if (process.env.NODE_ENV === 'development') {
		httpResponse.body.error = {
			...httpResponse.body.error,
			type: errorInfo.errorType,
			details: errorInfo.details,
			requestId,
			path: req.path,
			timestamp: errorResponse.timestamp,
		};
	}

	// Send response
	res.status(errorInfo.statusCode).json(httpResponse.body);

	// Log final error summary
	logger.info('Error response sent:', {
		requestId,
		statusCode: errorInfo.statusCode,
		errorType: errorInfo.errorType,
		message: errorInfo.message,
	});
}

/**
 * Async error wrapper for route handlers
 */
export function asyncErrorHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any
) {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * Create custom HTTP exceptions
 */
export function createError(
	message: string,
	statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
	details?: string
): HTTPException {
	return new HTTPException(message, statusCode, details);
}

/**
 * Validation error helper
 */
export function createValidationError(message: string, details?: string): HTTPException {
	return createError(message, StatusCodes.BAD_REQUEST, details);
}

/**
 * Not found error helper
 */
export function createNotFoundError(resource: string): HTTPException {
	return createError(`${resource} not found`, StatusCodes.NOT_FOUND);
}

/**
 * Unauthorized error helper
 */
export function createUnauthorizedError(message: string = 'Unauthorized'): HTTPException {
	return createError(message, StatusCodes.UNAUTHORIZED);
}

/**
 * Forbidden error helper
 */
export function createForbiddenError(message: string = 'Forbidden'): HTTPException {
	return createError(message, StatusCodes.FORBIDDEN);
}

/**
 * Conflict error helper
 */
export function createConflictError(message: string): HTTPException {
	return createError(message, StatusCodes.CONFLICT);
}
