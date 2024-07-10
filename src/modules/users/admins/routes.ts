import callback from '../../../api/adapters/express-callback';
import { Router } from 'express';
import authenticate from '../../../infrastructure/security/authentication/authentication';
import {
	getAllAdmins,
	getAdmin,
	updateAdmin,
	banAdmin,
	banCaregiver,
	banPatient,
	verifyPatient,
	verifyCaregiver,
} from './admin.controller';
import isAdmin from '../../../infrastructure/security/authorization/is-admin';
import isBanned from '../../../infrastructure/security/authorization/is-banned';

const router = Router();

router.get('/', authenticate, isAdmin, isBanned, callback(getAllAdmins()));
router.get('/:id', authenticate, isAdmin, isBanned, callback(getAdmin()));
router.patch('/:id', authenticate, isAdmin, isBanned, callback(updateAdmin()));
router.patch('/:id/ban', authenticate, isAdmin, isBanned, callback(banAdmin()));
router.patch('/caregiver/:id/ban', authenticate, isAdmin, isBanned, callback(banCaregiver()));
router.patch('/caregiver/:id/verify', authenticate, isAdmin, isBanned, callback(verifyCaregiver()));
router.patch('/patient/:id/ban', authenticate, isAdmin, isBanned, callback(banPatient()));
router.patch('/patient/:id/verify', authenticate, isAdmin, isBanned, callback(verifyPatient()));

export default router;
