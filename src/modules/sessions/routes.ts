import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import {
    cancelSession,
    confirmSession,
    getCaregiverSessions,
    getPatientSessions,
    getSession
} from "@/modules/sessions/controller";

const router = Router();

router.post("/sessions/:id", makeCallback(getSession()));
router.post("/sessions/confirm/:id", makeCallback(confirmSession()));
router.post("/sessions/cancel/:id", makeCallback(cancelSession()));
router.post("/patients/sessions", makeCallback(getPatientSessions()));
router.post("/caregivers/sessions", makeCallback(getCaregiverSessions()));

export { router as authRouter }
