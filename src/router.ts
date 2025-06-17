import appointmentRouter from './modules/appointments/routes';
import profileRouter from './modules/auth/profile/routes';
import ratingsRouter from './modules/ratings/routes';
import testRouter from './modules/heath/routes';
import authRouter from './modules/auth/routes';
import patientRouter from './modules/users/patients/routes';
import caregiverRouter from './modules/users/caregivers/routes';
import meRouter from './modules/auth/me/routes';
import paymentsRouter from './modules/payments/routes';
import adminRouter from './modules/users/admins/routes';
import express from 'express';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import crypto from 'node:crypto';
import { envars } from './config';
import errorMiddleware from './middlewares/error-middleware';
import { otpRouter } from './modules/sms/routes';
import { privacy } from './utils/privacy';
import { emailRouter } from './modules/email/routes';
import { dashboardRouter } from './modules/dashboard/routes';
import { StatusCodes } from 'http-status-codes';
import { accountDeletionPage } from './utils/account-deletion-page';

const router = express.Router();

router.use( cors() );
router.use( compression() );
router.use( helmet() );
router.use( express.json() );
router.use( express.urlencoded( { extended: true } ) );
router.use( express.static( path.join( __dirname, 'public' ) ) );
router.use( '/static', express.static( 'public' ) );

router.use( ( _req, res, next ) => {
	const nonce = Buffer.from( crypto.randomBytes( 16 ) ).toString( "base64" ); // Generate a nonce
	res.locals.nonce = nonce; // Store the nonce for later use

	res.setHeader(
		"Content-Security-Policy",
		`script-src 'self' 'nonce-${nonce}' http://localhost:8000 https://lkb.ianbalijawa.com;`
	);

	next();
} );

router.use( morgan( 'dev' ) );

const ONE_MINUTE = 1 * 60 * 1000;
router.use(
	rateLimit( {
		windowMs: ONE_MINUTE,
		limit: envars.NODE_ENV === 'production' ? 60 : Number.MAX_SAFE_INTEGER,
		validate: {
			trustProxy: false,
			xForwardedForHeader: false,
		},
	} )
);

const PREFIX = '/api/v1.1';

router.use( `${PREFIX}/test`, testRouter );
router.use( `${PREFIX}/auth`, authRouter );
router.use( `${PREFIX}/appointments`, appointmentRouter );
router.use( `${PREFIX}/dashboard`, dashboardRouter );
router.use( `${PREFIX}/profile`, profileRouter );
router.use( `${PREFIX}/ratings`, ratingsRouter );
router.use( `${PREFIX}/patients`, patientRouter );
router.use( `${PREFIX}/caregivers`, caregiverRouter );
router.use( `${PREFIX}/admins`, adminRouter );
router.use( `${PREFIX}/payments`, paymentsRouter );
router.use( `${PREFIX}/otp`, otpRouter );
router.use( `${PREFIX}/mail`, emailRouter );
router.use( `${PREFIX}/me`, meRouter );

router.use( errorMiddleware );

router.get( '/privacy', function ( _, res ) {
	res.setHeader( 'Content-Type', 'text/html' );
	res.send( privacy );
} );

router.get( `${PREFIX}/auth/account-deletion`, function ( _, res ) {
	res.setHeader( 'Content-Type', 'text/html' );
	res.send( accountDeletionPage );
} );

router.get( '/linkbedsides/privacy', function ( _, res ) {
	res.setHeader( 'Content-Type', 'text/html' );
	res.send( privacy );
} );

router.get( '/', function ( request: express.Request, response: express.Response ) {
	return response
		.status( StatusCodes.OK )
		.send( { message: 'SERVER IS ONLINE!', requestHeaders: request.headers } );
} );

router.use( '*', function ( request: express.Request, response: express.Response ) {
	return response
		.status( StatusCodes.OK )
		.send( { message: 'ROUTE NOT FOUND!', requestHeaders: request.headers } );
} );

export default router;
