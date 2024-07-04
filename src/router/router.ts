import appointmentRouter from '../modules/appointments/routes';
import profileRouter from '../modules/auth/profile/routes';
import ratingsRouter from '../modules/ratings/routes';
import testRouter from '../modules/heath/routes';
import authRouter from '../modules/auth/routes';
import patientRouter from '../modules/users/patients/routes';
import caregiverRouter from '../modules/users/caregivers/routes';
import meRouter from '../modules/auth/me/routes';
import paymentsRouter from '../modules/payments/routes';
import adminRouter from '../modules/users/admins/routes';
import express from 'express';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { appendFile } from 'fs/promises';
import path from 'node:path';
import { EnvironmentVars, __PROD__ } from '../constants';
import errorMiddleware from '../middlewares/error-middleware';
import { otpRouter } from '../modules/comms/sms/routes';
import { html } from '../utils/privacy';
import { emailRouter } from '../modules/comms/email/routes';
import { dashboardRouter } from '../modules/dashboard/routes';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

router.use(cors());
router.use(compression());
router.use(helmet());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.join(__dirname, 'public')));

router.use(
	morgan('combined', {
		stream: {
			async write(str) {
				const log = new Uint8Array(Buffer.from(str));
				process.stdout.write(log);
				await appendFile(__PROD__ ? 'logs.prod.log' : 'logs.dev.log', log);
			},
		},
	})
);

const ONE_MINUTE = 1 * 60 * 1000;
router.use(
	rateLimit({
		windowMs: ONE_MINUTE,
		limit: EnvironmentVars.getNodeEnv() === 'production' ? 60 : Number.MAX_SAFE_INTEGER,
		validate: {
			trustProxy: false,
			xForwardedForHeader: false,
		},
	})
);

router.use('/test', testRouter);
router.use('/auth', authRouter);
router.use('/appointments', appointmentRouter);
router.use('/dashboard', dashboardRouter);
router.use('/profile', profileRouter);
router.use('/ratings', ratingsRouter);
router.use('/patients', patientRouter);
router.use('/caregivers', caregiverRouter);
router.use('/admins', adminRouter);
router.use('/payments', paymentsRouter);
router.use('/otp', otpRouter);
router.use('/mail', emailRouter);
router.use('/me', meRouter);

router.use(errorMiddleware);

router.get('/privacy', function (_, res) {
	res.setHeader('Content-Type', 'text/html');
	res.send(html);
});

router.get('/', function (request: express.Request, response: express.Response) {
	return response
		.status(StatusCodes.NOT_FOUND)
		.send({ message: 'SERVER IS ONLINE!', requestHeaders: request.headers });
});

router.use('*', function (request: express.Request, response: express.Response) {
	return response
		.status(StatusCodes.NOT_FOUND)
		.send({ message: 'ROUTE NOT FOUND!', requestHeaders: request.headers });
});

export default router;
