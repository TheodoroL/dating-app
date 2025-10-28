import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { createUser, loginUser } from "../controllers/auth.controller.js";
import { upload } from "../libs/multer/multer.js";
import { UserLoginSchema, UserSchema } from "../libs/schema/user.js";
import { zodValidatorMiddleware } from "../middleware/zod-validator.middleware.js";

export const authRouter = Router();

// Middleware para tratar erros do Multer
const handleMulterError = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    if (err.message.includes("Invalid file type")) {
      return res.status(400).json({
        message: err.message,
        hint: "Please upload a valid image file (JPEG, PNG, WEBP or GIF)"
      });
    }
    if (err.message.includes("File too large")) {
      return res.status(400).json({
        message: "File is too large. Maximum size is 5MB"
      });
    }
  }
  next(err);
};

// Upload opcional de foto de perfil (campo 'photo')
authRouter.post("/register", upload.single("photo"), handleMulterError, zodValidatorMiddleware(UserSchema), createUser);

authRouter.post("/login", zodValidatorMiddleware(UserLoginSchema), loginUser);
