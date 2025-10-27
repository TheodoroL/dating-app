import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
export const userRouter = Router();

userRouter.get("/", authMiddleware, getAllUsers);
