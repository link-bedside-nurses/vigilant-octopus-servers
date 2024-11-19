import callback from '../../../api/adapters/express-callback';
import { Router } from 'express';

import {
	deleteCaregiver,
	getAllCaregivers,
	getCaregiver,
	getCaregiverAppointments,
	searchCaregiversByLocation,
	updateCaregiver,
} from './caregiver.controller';
import authenticate from '../../../infra/security/authentication/authentication';
import isBanned from '../../../infra/security/authorization/is-banned';
import { uploadQualifications } from '../../../api/middlewares/fileUpload';
import { QualificationsController } from './qualifications';

const router = Router();

router.get('/', isBanned, callback(getAllCaregivers()));
router.get('/search', authenticate, isBanned, callback(searchCaregiversByLocation()));
router.get('/:id', authenticate, isBanned, callback(getCaregiver()));
router.get('/:id/appointments', authenticate, isBanned, callback(getCaregiverAppointments()));
router.patch('/:id', authenticate, isBanned, callback(updateCaregiver()));
router.delete('/:id', authenticate, isBanned, callback(deleteCaregiver()));
router.post(
	'/:id/qualifications',
	authenticate,
	isBanned,
	uploadQualifications.array('qualifications', 5), // Allow up to 5 files
	QualificationsController.uploadQualifications
);
router.get(
	'/:id/qualifications',
	authenticate,
	isBanned,
	QualificationsController.getQualificationDocs
);
router.get(
	'/:id/qualifications',
	authenticate,
	isBanned,
	QualificationsController.getQualificationDocs
);
router.get(
	'/:id/qualifications/:filename/download',
	authenticate,
	isBanned,
	QualificationsController.downloadQualificationDoc
);
export default router;
