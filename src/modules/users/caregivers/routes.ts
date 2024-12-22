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

const router = Router();

router.use( authenticate );
router.use( isBanned );

router.get( '/', callback( getAllCaregivers() ) );
router.get( '/search', callback( searchCaregiversByLocation() ) );
router.get( '/:id', callback( getCaregiver() ) );
router.get( '/:id/appointments', callback( getCaregiverAppointments() ) );
router.patch( '/:id', callback( updateCaregiver() ) );
router.patch( '/:id/profilePicture', callback( updateProfilePicture() ) );
router.delete( '/:id', callback( deleteCaregiver() ) );

// Qualifications routes
router.get( '/:id/qualifications', callback( getQualifications() ) );
router.post( '/:id/qualifications', callback( addQualifications() ) );
router.put( '/:id/qualifications', callback( updateQualifications() ) );
router.delete( '/:id/qualifications', callback( deleteQualification() ) );

export default router;
