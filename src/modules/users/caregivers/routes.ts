import callback from '../../../api/adapters/express-callback';
import { Router } from 'express';

import authenticate from '../../../infra/security/authentication/authentication';
import isBanned from '../../../infra/security/authorization/is-banned';
import { addQualifications, deleteQualification, getQualifications, updateQualifications } from './qualifications/qualifications-controller';
import { deleteCaregiver } from './delete-caregiver';
import { getAllCaregivers } from './get-all-caregivers';
import { getCaregiver } from './get-caregiver';
import { getCaregiverAppointments } from './get-caregiver-appointments';
import { searchCaregiversByLocation } from './search-caregivers-by-location';
import { updateCaregiver } from './update-caregiver';
import { updateProfilePicture } from './update-profile-image';
import { getCaregiverAppointmentHistory } from './get-caregiver-appointment-history';
import { getNearestCaregiver } from './get-nearest-caregiver';
import { cancelAppointmentRequest } from './cancel-appointment';
import { updateAvailability } from './availability/update-availability';

const router = Router();

router.use( authenticate );
router.use( isBanned );

// General caregiver routes
router.get( '/', callback( getAllCaregivers() ) );
router.get( '/search', callback( searchCaregiversByLocation() ) );
router.get( '/nearest', callback( getNearestCaregiver() ) );
router.get( '/:id', callback( getCaregiver() ) );
router.patch( '/:id', callback( updateCaregiver() ) );
router.patch( '/:id/profilePicture', callback( updateProfilePicture() ) );
router.delete( '/:id', callback( deleteCaregiver() ) );

// Appointment related routes
router.get( '/:id/appointments', callback( getCaregiverAppointments() ) );
router.get( '/:id/appointment-history', callback( getCaregiverAppointmentHistory() ) );
router.post( '/appointments/:appointmentId/cancel', callback( cancelAppointmentRequest() ) );

// Qualifications routes
router.get( '/:id/qualifications', callback( getQualifications() ) );
router.post( '/:id/qualifications', callback( addQualifications() ) );
router.put( '/:id/qualifications', callback( updateQualifications() ) );
router.delete( '/:id/qualifications', callback( deleteQualification() ) );

// Availability routes
router.patch( '/:id/availability', callback( updateAvailability() ) );

export default router;
