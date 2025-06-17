import callback from '../../express-callback';
import { Router } from 'express';

import { error, ping } from './controller';

const router = Router();

router.get( '/ping', callback( ping() ) );
router.get( '/error', callback( error() ) );

export default router;
