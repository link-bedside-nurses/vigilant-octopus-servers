import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { response } from '../utils/http-response';

const router = Router();

// GET /heath/ping
router.get( '/ping', async ( _req: Request, _res: Response, next: NextFunction ) => {
    try {
        console.log( 'server is running:sending pong' );
        return response( StatusCodes.OK, null, 'pong' );
    } catch ( err ) {
        return next( err );
    }
} );

// GET /heath/error
router.get( '/error', async ( _req: Request, _res: Response, next: NextFunction ) => {
    try {
        console.log( 'Intended Error!' );
        throw new Error( 'Intended Error!' );
    } catch ( err ) {
        return next( err );
    }
} );

export default router;
