import type { Request, Response } from "express";
import { prisma } from "../libs/database/prisma.js";
import type { Message } from "../libs/schema/message.js";

// Função auxiliar para calcular idade
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

// GET /matches/conversations - Lista todas as conversas do usuário
export async function getConversations(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;
    
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Buscar todos os matches do usuário
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId }
        ]
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Buscar informações dos outros usuários e contar mensagens não lidas
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;

        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            dob: true,
            photos: {
              where: { profilePhoto: true },
              take: 1,
              select: { url: true }
            }
          }
        });

        if (!otherUser) return null;

        return {
          matchId: match.id,
          otherUser: {
            id: otherUser.id,
            firstname: otherUser.firstname,
            lastname: otherUser.lastname,
            age: calculateAge(otherUser.dob),
            profilePhoto: otherUser.photos[0]?.url || null
          },
          lastMessage: match.messages[0] ? {
            id: match.messages[0].id,
            content: match.messages[0].content,
            senderId: match.messages[0].senderId,
            createdAt: match.messages[0].createdAt
          } : null,
          unreadCount: 0, // Por enquanto sempre 0 (podemos implementar depois)
          matchedAt: match.createdAt
        };
      })
    );

    const validConversations = conversations.filter(c => c !== null);

    res.status(200).json({
      conversations: validConversations,
      total: validConversations.length
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req: Request<{ matchId: string }, unknown, Message>, res: Response) {
  try {
    const currentUserId = req.user?.id;
    const { matchId } = req.params;
    const { content } = req.body;

    const match = await prisma.match.findUnique({
      where: { id: Number(matchId) }
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
      return res.status(403).json({ message: "You are not part of this match" });
    }

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

    const match = await prisma.match.findUnique({
      where: { id: Number(matchId) }
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
      return res.status(403).json({ message: "You are not part of this match" });
    }

    const messages = await prisma.message.findMany({
      where: { matchId: Number(matchId) },
      orderBy: { createdAt: "asc" }
    });

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
