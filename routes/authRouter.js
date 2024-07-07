import { Router } from "express";

const router = Router();

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authControllers.js";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../middleware/validationMiddleware.js";

router.post("/register", validateRegisterInput, registerUser);
router.post("/login", validateLoginInput, loginUser);
router.get("/logout", logoutUser);

export default router;
