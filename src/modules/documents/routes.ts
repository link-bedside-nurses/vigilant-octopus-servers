import callback from '@/adapters/express-callback'
import { Router } from 'express'

import authenticate from '@/middlewares/authentication'
import isBanned from '@/middlewares/is-banned'
import { uploadFiles } from '@/modules/documents/controller'
import multer from 'multer'
const router = Router()

const upload = multer( { dest: 'uploads/' } )

router.post( '/', authenticate, isBanned, upload.single( 'file' ), callback( uploadFiles() ) )

export { router as caregiverRouter }
