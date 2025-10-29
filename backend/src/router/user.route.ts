import { Router } from "express";
import { getDiscoverUsers, getMatches, getCurrentUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const userRouter = Router();

// GET /users/me - Buscar informações do usuário logado
userRouter.get("/me", authMiddleware, getCurrentUser);

// GET /users/discover - Descobrir novos usuários (estilo Tinder)
userRouter.get("/discover", authMiddleware, getDiscoverUsers);

// GET /users/matches - Ver seus matches
userRouter.get("/matches", authMiddleware, getMatches);
