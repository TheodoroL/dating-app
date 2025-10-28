import { Router } from "express";
import { dislikeUser, getReceivedLikes, getSentLikes, likeUser } from "../controllers/like.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const likeRouter = Router();

// Dar like em um usuário
likeRouter.post("/:userId", authMiddleware, likeUser);

// Dar dislike (skip) em um usuário
likeRouter.post("/:userId/dislike", authMiddleware, dislikeUser);

// Ver likes enviados
likeRouter.get("/sent", authMiddleware, getSentLikes);

// Ver likes recebidos
likeRouter.get("/received", authMiddleware, getReceivedLikes);
