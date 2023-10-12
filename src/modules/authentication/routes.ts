import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import {
    signinPatient,
    signinAdmin,
    signupCaregiver,
    signupAdmin,
    signinCaregiver,
    signupPatient
} from "@/modules/authentication/controller";

const router = Router();

router.post("/patient/signup", makeCallback(signupPatient()));
router.post("/patient/signin", makeCallback(signinPatient()));

router.post("/caregiver/signin", makeCallback(signinCaregiver()));
router.post("/caregiver/signup", makeCallback(signupCaregiver()));

router.post("/admin/signin", makeCallback(signinAdmin()));
router.post("/admin/signup", makeCallback(signupAdmin()));

export { router as authRouter }
