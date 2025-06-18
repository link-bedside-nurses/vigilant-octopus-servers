import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { response } from '../utils/http-response';
import { db } from '../database';

const router = Router();

// GET /dashboard/ - get overview stats
router.get( '/', async ( _req: Request, _res: Response, next: NextFunction ) => {
    try {
        const admins = await db.admins.find();
        const nurses = await db.nurses.find();
        const patients = await db.patients.find();
        const appointments = await db.appointments.find();
        const payments = await db.payments.find();

        const overviewData = {
            admins: admins.length,
            nurses: nurses.length,
            patients: patients.length,
            appointments: appointments.length,
            payments: payments.length,
        };
        return response( StatusCodes.OK, overviewData, 'Successfully returned stats overview' );
    } catch ( err ) {
        return next( err );
    }
} );

export default router;
