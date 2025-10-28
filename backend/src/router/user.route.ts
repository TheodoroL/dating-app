import { Router } from "express";
import { getDiscoverUsers, getMatches } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const userRouter = Router();

// GET /users - Descobrir novos usuários (estilo Tinder)
userRouter.get("/discover", authMiddleware, getDiscoverUsers);

// GET /users/matches - Ver seus matches
userRouter.get("/matches", authMiddleware, getMatches);
