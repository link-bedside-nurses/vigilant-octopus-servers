import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { db } from '../database';
import { APPOINTMENT_STATUSES } from '../interfaces';
import authenticate from '../security/authentication';
import { validateObjectID } from '../middlewares/validate-objectid';
import { response } from '../utils/http-response';
import { StatusCodes } from 'http-status-codes';

const router = Router();
router.use( authenticate );

// GET /appointments - get all appointments
router.get( '/', async ( _req: Request, _res: Response, next: NextFunction ) => {
    try {
        const appointments = await db.appointments
            .find( {} )
            .sort( { createdAt: 'desc' } )
            .populate( 'nurse' )
            .populate( 'patient' );
        return response( StatusCodes.OK, appointments, 'Appointments fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// POST /appointments - schedule appointment
router.post( '/', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const patient = req.body.patient;
        const appointment = req.body;
        const result = await db.appointments.create( { ...appointment, patient } );
        const populated = await ( await result.populate( 'patient' ) ).populate( 'nurse' );
        return response( StatusCodes.OK, populated, 'Appointment scheduled successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// GET /appointments/:id - get appointment by id
router.get( '/:id', validateObjectID, async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const appointment = await db.appointments.findById( req.params.id ).populate( 'nurse' ).populate( 'patient' );
        if ( !appointment ) return response( StatusCodes.NOT_FOUND, null, 'Appointment not found' );
        return response( StatusCodes.OK, appointment, 'Appointment fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// POST /appointments/history - get appointments history
router.post( '/history', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const status = req.body.status;
        const query: mongoose.FilterQuery<any> = {};
        if ( status ) query.status = status;
        const pipeline: mongoose.PipelineStage[] = [
            { $match: query },
            {
                $addFields: {
                    order: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$status', 'ongoing'] }, then: 1 },
                                { case: { $eq: ['$status', 'pending'] }, then: 2 },
                                { case: { $eq: ['$status', 'cancelled'] }, then: 3 },
                                { case: { $eq: ['$status', 'completed'] }, then: 4 }
                            ],
                            default: 5
                        }
                    }
                }
            },
            { $sort: { order: 1, createdAt: -1 } },
            { $lookup: { from: 'patients', localField: 'patient', foreignField: '_id', as: 'patient' } },
            { $lookup: { from: 'nurses', localField: 'nurse', foreignField: '_id', as: 'nurse' } },
            { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$nurse', preserveNullAndEmptyArrays: true } }
        ];
        const appointments = await db.appointments.aggregate( pipeline );
        return response( StatusCodes.OK, appointments, 'Appointments history fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// PATCH /appointments/:id/update - update appointment status
router.patch( '/:id/update', validateObjectID, async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { status } = req.body;
        const appointment = await db.appointments.findByIdAndUpdate( req.params.id, { status }, { new: true } );
        return response( StatusCodes.OK, appointment, 'Appointment status updated successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// PATCH /appointments/:id/reschedule - reschedule appointment
router.patch( '/:id/reschedule', validateObjectID, async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { date } = req.body;
        const appointment = await db.appointments.findByIdAndUpdate( req.params.id, { date }, { new: true } );
        return response( StatusCodes.OK, appointment, 'Appointment rescheduled successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// PATCH /appointments/:id/confirm - confirm appointment
router.patch( '/:id/confirm', validateObjectID, async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const appointment = await db.appointments.findByIdAndUpdate( req.params.id, { status: APPOINTMENT_STATUSES.IN_PROGRESS }, { new: true } );
        return response( StatusCodes.OK, appointment, 'Appointment confirmed successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// PATCH /appointments/:id/cancel - cancel appointment
router.patch( '/:id/cancel', validateObjectID, async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const appointment = await db.appointments.findByIdAndUpdate( req.params.id, { status: APPOINTMENT_STATUSES.CANCELLED }, { new: true } );
        return response( StatusCodes.OK, appointment, 'Appointment cancelled successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// DELETE /appointments/:id - delete appointment
router.delete( '/:id', validateObjectID, async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const appointment = await db.appointments.findByIdAndDelete( req.params.id );
        return response( StatusCodes.OK, appointment, 'Appointment deleted successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

export default router;
