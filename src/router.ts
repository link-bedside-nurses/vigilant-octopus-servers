import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import morgan from 'morgan';
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
import { privacy } from './utils/privacy';

const router = express.Router();

router.use(cors());
router.use(helmet());
router.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
});

router.use(limiter);

// Health check
router.get('/health', (_req, res) => {
	res.status(StatusCodes.OK).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Privacy policy
router.get('/privacy', (_req, res) => {
	res.send(privacy);
});

// Account deletion routes (public and API)
router.use('/account-deletion', accountDeletionRouter);

// API routes
const PREFIX = '/api/v1';

router.use(`${PREFIX}/auth`, authRouter);
router.use(`${PREFIX}/appointments`, appointmentRouter);
router.use(`${PREFIX}/nurses`, nurseRouter);
router.use(`${PREFIX}/patients`, patientRouter);
router.use(`${PREFIX}/payments`, paymentsRouter);
router.use(`${PREFIX}/admins`, adminRouter);
router.use(`${PREFIX}/email`, emailRouter);
router.use(`${PREFIX}/messaging`, messagingRouter);
router.use(`${PREFIX}/dashboard`, dashboardRouter);

// Error handling middleware
router.use(errorMiddleware);

export default router;
