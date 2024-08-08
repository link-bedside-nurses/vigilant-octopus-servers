import callback from '../../api/adapters/express-callback';
import { Router } from 'express';

import { postRating, deleteRating, getAllRatings, getCaregiverRatings, getRating } from '.';
import authenticate from '../../infra/security/authentication/authentication';
import isBanned from '../../infra/security/authorization/is-banned';

const router = Router();

router.get('/', authenticate, isBanned, callback(getAllRatings()));
router.get('/:id', authenticate, isBanned, callback(getRating()));
router.get('/:id/caregiver', authenticate, isBanned, callback(getCaregiverRatings()));
router.post('/add', authenticate, isBanned, callback(postRating()));
router.delete('/:id/delete', authenticate, isBanned, callback(deleteRating()));

export default router;
