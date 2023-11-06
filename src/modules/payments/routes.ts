import makeCallback from '@/adapters/express-callback'
import { Router } from 'express'

import authenticate from '@/middlewares/authentication'
import { deletePayment, getAllPayments, getPayment } from '@/modules/payments/controller'

const router = Router()

router.get('/', authenticate, makeCallback(getAllPayments()))
router.get('/:id', authenticate, makeCallback(getPayment()))
router.delete('/:id', authenticate, makeCallback(deletePayment()))

export { router as paymentsRouter }
