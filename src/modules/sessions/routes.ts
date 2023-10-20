import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import {
  cancelSession,
  confirmSession,
  getSession,
  getSessions,
} from "@/modules/sessions/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.post("/confirm/:id", authenticate, makeCallback(confirmSession()));
router.post("/cancel/:id", authenticate, makeCallback(cancelSession()));

router.get("/patients", authenticate, makeCallback(getSessions()));
router.get("/:id", authenticate, makeCallback(getSession()));

export { router as sessionRouter };
