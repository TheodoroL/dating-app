import { Router } from "express";
import { getConversations, getMessages, sendMessage } from "../controllers/message.controller.js";
import { MessageSchema } from "../libs/schema/message.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { zodValidatorMiddleware } from "../middleware/zod-validator.middleware.js";

export const messageRouter = Router();

// Listar todas as conversas do usuário
messageRouter.get("/conversations", authMiddleware, getConversations);

// Enviar mensagem em um match
messageRouter.post("/:matchId/messages", authMiddleware, zodValidatorMiddleware(MessageSchema), sendMessage);

// Buscar mensagens de um match
messageRouter.get("/:matchId/messages", authMiddleware, getMessages);
