import { Router } from "express";
import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
} from "../controllers/userControllers.js";
import { validateUpdateUserInput } from "../middleware/validationMiddleware.js";
import { authorizePermissions } from "../middleware/authMiddleware.js";
const router = Router();

router.get("/current-user", getCurrentUser);
router.get(
  "/admin/app-stats",
  authorizePermissions("admin"),
  getApplicationStats
);
//if we use just authorizePermissions, this will act as express middleware which will have access to req, res, next
//but here we are using authorizePermissions('admin') which is not a express middlware but a higher order function
//which will return a middleware function which will have access to req, res, next
router.patch("/update-user", validateUpdateUserInput, updateUser);

export default router;
