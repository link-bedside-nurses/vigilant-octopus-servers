import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import {
  addRating,
  getRatings,
  getSingleRating,
} from "@/modules/ratings/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.get("/", authenticate, makeCallback(getRatings()));
router.get("/:id", authenticate, makeCallback(getSingleRating()));
router.post("/", authenticate, makeCallback(addRating()));

export { router as ratingsRouter };
