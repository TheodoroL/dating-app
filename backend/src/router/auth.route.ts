import { Router } from "express";
import { createUser, loginUser } from "../controllers/auth.controller.js";
import { UserLoginSchema, UserSchema } from "../libs/schema/user.js";
import { zodValidatorMiddleware } from "../middleware/zod-validator.middleware.js";
export const authRouter = Router();

authRouter.post("/register", zodValidatorMiddleware(UserSchema), createUser);
authRouter.post("/login", zodValidatorMiddleware(UserLoginSchema), loginUser);
