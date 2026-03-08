import express from "express";

import {
  updateProfile,
  checkAuth,
} from "../controllers/userControllers.js";
import { protectRoute } from "../middleware/clerk.js";
const userRouter = express.Router();

userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;