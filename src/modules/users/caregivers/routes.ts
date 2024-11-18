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
import { upload } from '../../../api/middlewares/fileUpload';
import { uploadQualifications } from './upload-qualifications';
import { getCaregiverQualifications } from './get-caregiver-qualifications';
import { getQualificationDocument } from './get-qualification-document';
import { streamQualificationDocument } from './stream-qualification-document';

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
	upload.array('qualifications', 5), // Allow up to 5 files
	callback(uploadQualifications())
);
// Get all qualifications for a caregiver
router.get('/:id/qualifications', authenticate, isBanned, callback(getCaregiverQualifications()));

// Get metadata for a specific qualification document
router.get(
	'/:id/qualifications/:documentPath',
	authenticate,
	isBanned,
	callback(getQualificationDocument())
);

// Stream/download a specific qualification document
router.get(
	'/:id/qualifications/:documentPath/stream',
	authenticate,
	isBanned,
	streamQualificationDocument
);

export default router;
