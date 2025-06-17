import callback from '../../express-callback';
import { Router } from 'express';

import { postRating, deleteRating, getAllRatings, getCaregiverRatings, getRating } from '.';
import authenticate from '../../security/authentication';
import isBanned from '../../security/is-banned';

const router = Router();

router.get( '/', authenticate, isBanned, callback( getAllRatings() ) );
router.get( '/:id', authenticate, isBanned, callback( getRating() ) );
router.get( '/:id/caregiver', authenticate, isBanned, callback( getCaregiverRatings() ) );
router.post( '/add', authenticate, isBanned, callback( postRating() ) );
router.delete( '/:id/delete', authenticate, isBanned, callback( deleteRating() ) );

export default router;
