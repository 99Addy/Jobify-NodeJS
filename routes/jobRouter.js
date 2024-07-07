import { Router } from "express";

const router = Router();

import {
  createJob,
  deleteJob,
  getAllJobs,
  getSingleJob,
  updateJob,
} from "../controllers/jobControllers.js";
import {
  validateIdParam,
  validateJobInput,
} from "../middleware/validationMiddleware.js";

// auth middleware is not used here as we need to authenticate the user before accessing any job route, so
// rather than placing it before each route, we will place it before the router itself in server.js
router.route("/").get(getAllJobs).post(validateJobInput, createJob);
router
  .route("/:id")
  .get(validateIdParam, getSingleJob)
  .patch(validateJobInput, validateIdParam, updateJob)
  .delete(validateIdParam, deleteJob);

export default router;
