import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { APPOINTMENT_STATUSES } from '../interfaces';
import authenticate from '../security/authentication';
import { NurseCancellationService } from '../services/nurse-cancellation';
import path from 'path';
import fs from 'fs';
import { getMimeType } from '../utils/mime-types';
import { response } from '../utils/http-response';
import { StatusCodes } from 'http-status-codes';

const router = Router();

// General nurse routes
router.get( '/', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { latLng } = req.query;
        let nurses;
        if ( latLng ) {
            const latitude = latLng.toString().split( ',' )[0];
            const longitude = latLng.toString().split( ',' )[1];
            if ( !latitude || !longitude ) {
                return response( StatusCodes.BAD_REQUEST, null, "Missing either latitude or longitude on the 'latLng' query key" );
            }
            nurses = await db.nurses.find( {
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                    },
                },
            } );
        } else {
            nurses = await db.nurses.find( {} ).sort( { createdAt: 'desc' } );
        }
        return response( StatusCodes.OK, nurses, 'Nurses fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.use( authenticate );

router.get( '/:id', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const nurse = await db.nurses.findById( req.params.id );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'No nurse Found' );
        return response( StatusCodes.OK, nurse, 'Nurse fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.patch( '/:id', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const updated = req.body;
        const nurse = await db.nurses.findByIdAndUpdate( req.params.id, updated, { new: true } );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'No nurse Found' );
        return response( StatusCodes.OK, nurse, 'Nurse updated successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.patch( '/:id/profilePicture', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { profileImageUrl } = req.body;
        const nurse = await db.nurses.findById( req.params.id );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'Nurse not found' );
        nurse.imgUrl = profileImageUrl;
        await nurse.save();
        return response( StatusCodes.OK, nurse, 'Nurse profile picture updated successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.delete( '/:id', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        // Cancel any pending or in-progress appointments
        await db.appointments.updateMany(
            { nurse: req.params.id, status: APPOINTMENT_STATUSES.PENDING },
            { $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Nurse account deleted' } }
        );
        await db.appointments.updateMany(
            { nurse: req.params.id, status: APPOINTMENT_STATUSES.IN_PROGRESS },
            { $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Nurse account deleted' } }
        );
        // Delete the nurse document
        const nurse = await db.nurses.findByIdAndDelete( req.params.id );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'No nurse Found' );
        return response( StatusCodes.OK, nurse, 'Nurse deleted successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// Appointment related routes
router.get( '/:id/appointments', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const appointments = await db.appointments.find( { nurse: { _id: req.params.id } } ).populate( 'patient' ).populate( 'nurse' );
        return response( StatusCodes.OK, appointments, 'Appointments fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.get( '/:id/appointment-history', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const appointments = await db.appointments.find( { nurse: { _id: req.params.id } } ).populate( 'patient' ).populate( 'nurse' );
        const filteredAppointments = appointments.filter( ( appointment: any ) => appointment.status === APPOINTMENT_STATUSES.COMPLETED || appointment.status === APPOINTMENT_STATUSES.CANCELLED );
        return response( StatusCodes.OK, filteredAppointments, 'Appointments fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.post( '/appointments/:appointmentId/cancel', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { appointmentId } = req.params;
        const nurseId = ( req as any ).account?.id;
        if ( !nurseId ) return response( StatusCodes.UNAUTHORIZED, null, 'Unauthorized access' );
        // Update appointment status
        const appointment = await db.appointments.findOneAndUpdate(
            { _id: appointmentId, nurse: nurseId },
            { $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Cancelled by nurse' } },
            { new: true }
        );
        if ( !appointment ) return response( StatusCodes.NOT_FOUND, null, 'Appointment not found or not assigned to this nurse' );
        // Add nurse to cancelled list in Redis
        await NurseCancellationService.addCancelledNurse( appointmentId, nurseId );
        return response( StatusCodes.OK, appointment, 'Appointment cancelled successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// Qualifications routes
router.get( '/:id/qualifications', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const nurse = await db.nurses.findById( req.params.id );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'Nurse not found' );
        return response( StatusCodes.OK, { nurseId: req.params.id, qualifications: nurse.qualifications || [] }, 'Nurse qualifications fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.post( '/:id/qualifications', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { qualificationUrls } = req.body;
        const nurse = await db.nurses.findById( req.params.id );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'Nurse not found' );
        const newQualifications = qualificationUrls.filter( ( url: string ) => !nurse.qualifications.includes( url ) );
        nurse.qualifications = [...nurse.qualifications, ...newQualifications];
        await nurse.save();
        return response( StatusCodes.OK, nurse, 'Nurse qualifications updated successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.put( '/:id/qualifications', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { qualificationUrls } = req.body;
        const nurse = await db.nurses.findById( req.params.id );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'Nurse not found' );
        nurse.qualifications = qualificationUrls;
        await nurse.save();
        return response( StatusCodes.OK, nurse, 'Nurse qualifications updated successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

router.delete( '/:id/qualifications', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { qualificationUrl } = req.query;
        const nurse = await db.nurses.findById( req.params.id );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'Nurse not found' );
        nurse.qualifications = nurse.qualifications.filter( ( url: string ) => url !== qualificationUrl );
        await nurse.save();
        return response( StatusCodes.OK, nurse, 'Nurse qualifications updated successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

// Get nurse qualification document info
router.get( '/:id/qualifications/:documentPath', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const { id, documentPath } = req.params;
        const nurse = await db.nurses.findById( id );
        if ( !nurse ) return response( StatusCodes.NOT_FOUND, null, 'Nurse not found' );
        if ( !nurse.qualifications.includes( documentPath ) ) {
            return response( StatusCodes.FORBIDDEN, null, 'Document not found for this nurse' );
        }
        const fullPath = path.join( process.cwd(), documentPath );
        if ( !fs.existsSync( fullPath ) ) {
            return response( StatusCodes.NOT_FOUND, null, 'Document file not found' );
        }
        const stats = fs.statSync( fullPath );
        const fileInfo = {
            path: documentPath,
            fileName: path.basename( documentPath ),
            size: stats.size,
            uploadDate: stats.mtime,
            mimeType: getMimeType( path.extname( documentPath ).toLowerCase() ),
        };
        return response( StatusCodes.OK, fileInfo, 'Document file info fetched successfully' );
    } catch ( err ) {
        return next( err );
    }
} );

export default router;
