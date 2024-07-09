import callback from '../../adapters/express-callback';
import { Router } from 'express';

import {
	postRating,
	deleteRating,
	getAllRatings,
	getCaregiverRatings,
	getRating,
} from '../../modules/ratings/controller';
import authenticate from '../../middlewares/auth/authentication';
import isBanned from '../../middlewares/auth/is-banned';

const router = Router();

router.get('/', authenticate, isBanned, callback(getAllRatings()));
router.get('/:id', authenticate, isBanned, callback(getRating()));
router.get('/:id/caregiver', authenticate, isBanned, callback(getCaregiverRatings()));
router.post('/add', authenticate, isBanned, callback(postRating()));
router.delete('/:id/delete', authenticate, isBanned, callback(deleteRating()));

export default router;
