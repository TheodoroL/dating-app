import type { Request, Response } from "express";
import { prisma } from "../libs/database/prisma.js";
import type { Message } from "../libs/schema/message.js";

// POST /matches/:matchId/messages - Enviar mensagem em um match
export async function sendMessage(req: Request<{ matchId: string }, unknown, Message>, res: Response) {
  try {
    const currentUserId = req.user?.id;
    const { matchId } = req.params;
    const { content } = req.body;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verificar se o match existe e se o usuário faz parte dele
    const match = await prisma.match.findUnique({
      where: { id: Number(matchId) }
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
      return res.status(403).json({ message: "You are not part of this match" });
    }

    // Criar a mensagem
    const message = await prisma.message.create({
      data: {
        senderId: currentUserId,
        matchId: Number(matchId),
        content
      }
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        sentAt: message.createdAt
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;
    const { matchId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verificar se o match existe e se o usuário faz parte dele
    const match = await prisma.match.findUnique({
      where: { id: Number(matchId) }
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
      return res.status(403).json({ message: "You are not part of this match" });
    }

    // Buscar as mensagens
    const messages = await prisma.message.findMany({
      where: { matchId: Number(matchId) },
      orderBy: { createdAt: "asc" }
    });

    // Buscar informações dos usuários
    const senderIds = [...new Set(messages.map(msg => msg.senderId))];
    const users = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        photos: {
          where: { profilePhoto: true },
          take: 1,
          select: { url: true }
        }
      }
    });

    const formattedMessages = messages.map(msg => {
      const sender = users.find(u => u.id === msg.senderId);
      return {
        id: msg.id,
        content: msg.content,
        sentAt: msg.createdAt,
        sender: sender
          ? {
              id: sender.id,
              name: `${sender.firstname} ${sender.lastname}`,
              photo: sender.photos[0]?.url || null
            }
          : null,
        isCurrentUser: msg.senderId === currentUserId
      };
    });

    res.status(200).json({
      messages: formattedMessages,
      total: formattedMessages.length
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
