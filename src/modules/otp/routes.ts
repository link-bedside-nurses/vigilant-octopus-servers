import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import { getOTP, verifyOTP } from "@/modules/otp/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.get("/", authenticate, makeCallback(getOTP()));
router.post("/verify", authenticate, makeCallback(verifyOTP()));

export { router as otpRouter };
