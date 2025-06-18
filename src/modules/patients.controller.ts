import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { APPOINTMENT_STATUSES } from '../interfaces';
import authenticate from '../security/authentication';
import { response } from '../utils/http-response';
import { StatusCodes } from 'http-status-codes';

const router = Router();

// All routes require authentication
router.use( authenticate );

// GET /patients - get all patients
router.get( '/', async ( _req: Request, _res: Response, next: NextFunction ) => {
    try {
        const patients = await db.patients.find( {} ).sort( { createdAt: 'desc' } );
        return response( StatusCodes.OK, patients, 'Patients Retrieved' );
    } catch ( err ) {
        return next( err );
    }
} );

// GET /patients/:id - get patient by id
router.get( '/:id', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const patient = await db.patients.findById( req.params.id );
        if ( !patient ) return response( StatusCodes.NOT_FOUND, null, 'No Patient Found' );
        return response( StatusCodes.OK, patient, 'Patient Retrieved' );
    } catch ( err ) {
        return next( err );
    }
} );

// GET /patients/:id/appointments - get patient appointments
router.get( '/:id/appointments', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { status } = req.query;
        const filters: any = { patient: { _id: req.params.id } };
        if ( status ) filters.status = status;
        const appointments = await db.appointments.find( filters ).populate( 'nurse' ).populate( 'patient' );
        const message = appointments.length > 0 ? 'Successfully fetched patient Appointments' : 'No Appointment Found';
        return response( StatusCodes.OK, appointments, message );
    } catch ( err ) {
        return next( err );
    }
} );

// PATCH /patients/:id - update patient
router.patch( '/:id', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const patient = await db.patients.findByIdAndUpdate( req.params.id, { ...req.body }, { new: true } );
        if ( !patient ) return response( StatusCodes.NOT_FOUND, null, 'No Patient Found' );
        return response( StatusCodes.OK, patient, 'Patient updated' );
    } catch ( err ) {
        return next( err );
    }
} );

// PATCH /patients/deactivate/:id - deactivate patient
router.patch( '/deactivate/:id', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const patient = await db.patients.findByIdAndUpdate( req.params.id, { $set: { isActive: false } }, { new: true } );
        if ( !patient ) return response( StatusCodes.NOT_FOUND, null, 'No Patient Found' );
        return response( StatusCodes.OK, patient, 'Patient updated' );
    } catch ( err ) {
        return next( err );
    }
} );

// DELETE /patients/:id - delete patient
router.delete( '/:id', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        // Cancel any pending or in-progress appointments
        await db.appointments.updateMany(
            { patient: req.params.id, status: { $in: [APPOINTMENT_STATUSES.PENDING, APPOINTMENT_STATUSES.IN_PROGRESS] } },
            { $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Patient account deleted' } }
        );
        // Delete the patient document
        const patient = await db.patients.findByIdAndDelete( req.params.id );
        if ( !patient ) return response( StatusCodes.NOT_FOUND, null, 'No Patient Found' );
        return response( StatusCodes.OK, patient, 'Patient deleted' );
    } catch ( err ) {
        return next( err );
    }
} );

export default router;
