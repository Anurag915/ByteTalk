import express from "express";

import {
  updateProfile,
  checkAuth,
  signUp,
  Login,
} from "../controllers/userControllers.js";
import { protectRoute } from "../middleware/auth.js";
const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", Login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;