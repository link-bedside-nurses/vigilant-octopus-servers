import 'dotenv/config';
import 'reflect-metadata';
import { replaceTscAliasPaths } from 'tsc-alias';

import compression from 'compression';
import express, { Application } from 'express';
import 'express-async-errors';
import { createServer, Server as HTTPServer } from 'http';
import Redis from 'ioredis';

import envars from './config/env-vars';
import { scheduleAccountDeletionJob } from './cron/account-deletion-job';
import { connectToDatabase, disconnectFromDatabase } from './database';

import router from './router';
import logger from './utils/logger';

// Initialize tsc-alias path replacement
replaceTscAliasPaths().catch((err: Error) => logger.info(err.message));

// Initialize Redis connection
let redis: Redis;

const initializeRedis = async (): Promise<void> => {
	try {
		logger.info('Initializing Redis connection...');

		redis = new Redis({
			host: envars.REDIS_HOST || '127.0.0.1',
			port: parseInt(envars.REDIS_PORT || '6379'),
			password: envars.REDIS_PASSWORD,
			maxRetriesPerRequest: 3,
			connectTimeout: 10000,
			lazyConnect: true,
		});

		redis.on('error', (err) => {
			logger.error('Redis Client Error:', err);
		});

		redis.on('connect', () => {
			logger.info('Connected to Redis');
		});

		redis.on('ready', () => {
			logger.info('Redis is ready to accept connections');
		});

		redis.on('close', () => {
			logger.warn('Redis connection closed');
		});

		redis.on('reconnecting', () => {
			logger.info('Reconnecting to Redis...');
		});

		// Test the connection
		await redis.ping();
		logger.info('Redis ping successful');

		// Make redis available globally
		(global as any).redis = redis;
	} catch (error) {
		logger.error('Failed to initialize Redis:', error);
		throw error;
	}
};

/**
 * Application class to encapsulate server logic
 */
class App {
	private app: Application;
	private server: HTTPServer;
	private accountDeletionCronJob: any = null;
	private isShuttingDown = false;

	constructor() {
		this.app = express();
		this.server = createServer(this.app);

		this.initializeMiddlewares();
		this.initializeRoutes();
		this.initializeErrorHandling();
		this.initializeProcessHandlers();
	}

	/**
	 * Initialize application middlewares
	 */
	private initializeMiddlewares(): void {
		// Security headers
		this.app.set('trust proxy', 1);
		this.app.set('x-powered-by', false);

		// Compression middleware for better performance
		this.app.use(
			compression({
				level: 6,
				threshold: 1024,
				filter: (req, res) => {
					if (req.headers['x-no-compression']) {
						return false;
					}
					return compression.filter(req, res);
				},
			})
		);

		// Static files
		this.app.use(
			express.static('public', {
				maxAge: '1d',
				etag: true,
			})
		);

		// Body parsing
		this.app.use(express.json({ limit: '10mb' }));
		this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
	}

	/**
	 * Initialize application routes
	 */
	private initializeRoutes(): void {
		this.app.use(router);
	}

	/**
	 * Initialize error handling
	 */
	private initializeErrorHandling(): void {
		// Enhanced unhandled rejection handling
		process.on('unhandledRejection', (reason, promise) => {
			if (this.isShuttingDown) return;

			const serializedPromise = JSON.stringify(promise);
			const serializedReason = reason instanceof Error ? reason.stack : reason;

			logger.error(
				`Unhandled Rejection. \nPromise: ${serializedPromise} \nReason: ${serializedReason}. \nTimestamp: ${new Date().toISOString()} }`
			);

			// In production, we might want to exit the process
			if (envars.NODE_ENV === 'production') {
				logger.error('Exiting due to unhandled rejection in production');
				process.exit(1);
			}
		});

		// Enhanced uncaught exception handling
		process.on('uncaughtException', (exception) => {
			if (this.isShuttingDown) return;

			logger.error(
				`Uncaught Exception. ${exception}. \n${exception.stack}. \nTimestamp ${new Date().toISOString()}`
			);

			// Give time for logs to be written before exit
			setTimeout(() => {
				logger.error('Forced exit due to uncaught exception');
				process.exit(1);
			});
		});
	}

	/**
	 * Initialize process signal handlers
	 */
	private initializeProcessHandlers(): void {
		const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

		shutdownSignals.forEach((signal) => {
			process.on(signal, () => this.gracefulShutdown(signal));
		});
	}

	/**
	 * Graceful shutdown handler
	 */
	private async gracefulShutdown(signal: string): Promise<void> {
		if (this.isShuttingDown) {
			logger.warn('Shutdown already in progress, ignoring signal:', signal);
			return;
		}

		this.isShuttingDown = true;
		logger.info(`Received ${signal}. Starting graceful shutdown...`);

		try {
			// Stop accepting new connections
			this.server.close((error) => {
				if (error) {
					logger.error('Failed to close server:', error);
				} else {
					logger.info('Server closed successfully');
				}
			});

			// Stop the cron job if it exists
			if (this.accountDeletionCronJob) {
				this.accountDeletionCronJob.stop();
				logger.info('Account deletion cron job stopped');
			}

			// Close Redis connection
			if (redis) {
				await redis.quit();
				logger.info('Redis connection closed');
			}

			// Disconnect from database
			await disconnectFromDatabase();
			logger.info('Database disconnected');

			// Force exit after 10 seconds if graceful shutdown fails
			setTimeout(() => {
				logger.error('Forced shutdown after timeout');
				process.exit(1);
			}, 10000);

			logger.info('Graceful shutdown completed');
			process.exit(0);
		} catch (error) {
			logger.error('Error during graceful shutdown:', error);
			process.exit(1);
		}
	}

	/**
	 * Start the application
	 */
	public async start(): Promise<void> {
		try {
			console.clear();
			await initializeRedis();

			await connectToDatabase();

			// Schedule the account deletion cron job
			this.accountDeletionCronJob = scheduleAccountDeletionJob();

			// Start the server
			this.server.listen(envars.PORT, () => {
				logger.info(`Server started successfully`);
				logger.info(`Environment: ${envars.NODE_ENV}`);
				logger.info(`Server URL: http://127.0.0.1:${envars.PORT}`);
				logger.info(`Health Check: http://127.0.0.1:${envars.PORT}/health`);
				logger.info(`API Documentation: http://127.0.0.1:${envars.PORT}/api/v1/docs`);
			});
		} catch (error) {
			logger.error('Failed to start server:', error);
			process.exit(1);
		}
	}

	/**
	 * Get the Express app instance
	 */
	public getApp(): Application {
		return this.app;
	}

	/**
	 * Get the HTTP server instance
	 */
	public getServer(): HTTPServer {
		return this.server;
	}
}

// Create and start the application
const app = new App();

// Start the application
app.start().catch((error) => {
	logger.error('Failed to initialize application:' + error);
	process.exit(1);
});

// Export for testing purposes
export { app, App };
export default app;
