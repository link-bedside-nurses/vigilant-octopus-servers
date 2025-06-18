import callback from '../../express-callback';
import { Router } from 'express';

import { requestAccountDeletion } from '../../modules/auth/controller';
import { adminSignup } from './signup/admin';
import { nurseSignup } from './signup/nurse';
import { patientSignup } from './signup/patient';
import { adminSignin } from './signin/admin';
import { patientSignin } from './signin/patient';

const router = Router();

router.post( '/nurse/signup', callback( nurseSignup() ) );

router.post( '/patient/signup', callback( patientSignup() ) );
router.post( '/patient/signin', callback( patientSignin() ) );

router.post( '/admin/signin', callback( adminSignin() ) );
router.post( '/admin/signup', callback( adminSignup() ) );

// router.delete( '/accounts/deletion', callback( deleteAccount() ) );
router.delete( '/accounts/deletion', callback( requestAccountDeletion() ) );

export default router;
