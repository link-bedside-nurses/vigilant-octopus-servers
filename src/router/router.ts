import appointmentRouter from '@/modules/appointments/routes'
import profileRouter from '@/modules/profile/routes'
import ratingsRouter from '@/modules/ratings/routes'
import testRouter from '@/modules/test/routes'
import authRouter from '@/modules/auth/routes'
import patientRouter from '@/modules/patients/routes'
import caregiverRouter from '@/modules/caregivers/routes'
import meRouter from '@/modules/me/routes'
import paymentsRouter from '@/modules/payments/routes'
import adminRouter from '@/modules/admins/routes'
import otpRouter from '@/modules/sms/routes'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import errorMiddleware from '@/middlewares/error-middleware'
import { EnvironmentVars } from '@/constants'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { appendFile } from 'fs/promises'

const ROUTER = express.Router()

ROUTER.use( cors( { origin: "http://localhost:3000" } ) )
ROUTER.use( compression() )
ROUTER.use( helmet() )
ROUTER.use( express.json() )
ROUTER.use( express.urlencoded( { extended: true } ) )

ROUTER.use( morgan( 'combined', {
    stream: {
        async write( str ) {
            const log = new Uint8Array( Buffer.from( str ) );
            process.stdout.write( log )
            await appendFile( EnvironmentVars.getNodeEnv() === 'development' ? 'logs.dev.log' : "logs.prod.log", log )
        },
    }
} ) )

const ONE_MINUTE = 1 * 60 * 1000
ROUTER.use(
    rateLimit( {
        windowMs: ONE_MINUTE,
        limit: EnvironmentVars.getNodeEnv() === 'production' ? 10 : Number.MAX_SAFE_INTEGER,
    } ),
)

ROUTER.use( '/test', testRouter )
ROUTER.use( '/auth', authRouter )
ROUTER.use( '/appointments', appointmentRouter )
ROUTER.use( '/profile', profileRouter )
ROUTER.use( '/ratings', ratingsRouter )
ROUTER.use( '/patients', patientRouter )
ROUTER.use( '/caregivers', caregiverRouter )
ROUTER.use( '/admins', adminRouter )
ROUTER.use( '/payments', paymentsRouter )
ROUTER.use( '/otp', otpRouter )
ROUTER.use( '/me', meRouter )

ROUTER.use( errorMiddleware )

ROUTER.use( '/status', function ( request: express.Request, response: express.Response ) {
    return response.status( StatusCodes.OK ).send( { message: 'Server is online!', requestHeaders: request.headers } )
} )

ROUTER.use( '*', function ( request: express.Request, response: express.Response ) {
    return response.status( StatusCodes.NOT_FOUND ).send( { message: 'NOT FOUND!', requestHeaders: request.headers } )
} )

export default ROUTER

