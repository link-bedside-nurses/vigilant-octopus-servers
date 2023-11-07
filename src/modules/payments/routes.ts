import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import authenticate from '@/middlewares/authentication'
import { deletePayment, getAllPayments, getPayment } from '@/modules/payments/controller'
import isBanned from '@/middlewares/is-banned'

const router = Router()

router.get('/', authenticate, isBanned, makeCallback(getAllPayments()))
router.get('/:id', authenticate, isBanned, makeCallback(getPayment()))
router.delete('/:id', authenticate, isBanned, makeCallback(deletePayment()))

export { router as paymentsRouter }
