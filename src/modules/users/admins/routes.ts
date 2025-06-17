import callback from '../../../express-callback';
import { Router } from 'express';
import authenticate from '../../../security/authentication';
import isAdmin from '../../../security/is-admin';
import isBanned from '../../../security/is-banned';
import { banAdmin } from './ban-admin';
import { banCaregiver } from './ban-caregiver';
import { banPatient } from './ban-patient';
import { getAdmin } from './get-admin';
import { getAllAdmins } from './get-all-admins';
import { updateAdmin } from './update-admin';
import { verifyCaregiver } from './verify-caregiver';
import { verifyPatient } from './verify-patient';

const router = Router();

router.get( '/', authenticate, isAdmin, isBanned, callback( getAllAdmins() ) );
router.get( '/:id', authenticate, isAdmin, isBanned, callback( getAdmin() ) );
router.patch( '/:id', authenticate, isAdmin, isBanned, callback( updateAdmin() ) );
router.patch( '/:id/ban', authenticate, isAdmin, isBanned, callback( banAdmin() ) );
router.patch( '/caregiver/:id/ban', authenticate, isAdmin, isBanned, callback( banCaregiver() ) );
router.patch( '/caregiver/:id/verify', authenticate, isAdmin, isBanned, callback( verifyCaregiver() ) );
router.patch( '/patient/:id/ban', authenticate, isAdmin, isBanned, callback( banPatient() ) );
router.patch( '/patient/:id/verify', authenticate, isAdmin, isBanned, callback( verifyPatient() ) );

export default router;
