import type { Request, Response } from "express";
import { prisma } from "../libs/database/prisma.js";

// POST /likes/:userId - Dar like em um usuário
export async function likeUser(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;
    const { userId: targetUserId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot like yourself" });
    }

    // Verificar se o usuário alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verificar se já curtiu antes
    const existingLike = await prisma.like.findFirst({
      where: {
        fromUserId: currentUserId,
        toUserId: targetUserId
      }
    });

    if (existingLike) {
      return res.status(409).json({ message: "You already liked this user" });
    }

    // Criar o like
    await prisma.like.create({
      data: {
        fromUserId: currentUserId,
        toUserId: targetUserId
      }
    });

    // 🔍 VERIFICAR SE HOUVE MATCH
    // Checa se o outro usuário também curtiu você (like mútuo)
    const mutualLike = await prisma.like.findFirst({
      where: {
        fromUserId: targetUserId,
        toUserId: currentUserId
      }
    });

    let match = null;

    // 💘 SE AMBOS CURTIRAM, CRIA O MATCH!
    if (mutualLike) {
      // Verificar se o match já não existe (para evitar duplicatas)
      const existingMatch = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: currentUserId, user2Id: targetUserId },
            { user1Id: targetUserId, user2Id: currentUserId }
          ]
        }
      });

      if (!existingMatch) {
        match = await prisma.match.create({
          data: {
            user1Id: currentUserId,
            user2Id: targetUserId
          }
        });
      } else {
        match = existingMatch;
      }
    }

    res.status(201).json({
      message: match ? "It's a match! 🎉" : "Like sent successfully",
      match: match
        ? {
            id: match.id,
            matchedWith: {
              id: targetUser.id,
              firstname: targetUser.firstname,
              lastname: targetUser.lastname
            }
          }
        : null,
      isMatch: !!match
    });
  } catch (error) {
    console.error("Error liking user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /likes/:userId/dislike - Dar dislike (skip)
export async function dislikeUser(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // No Tinder, dislike apenas não mostra mais o usuário
    // Você pode implementar uma tabela separada de "dislikes" se quiser
    // Por enquanto, apenas retornamos sucesso (o usuário não aparece mais porque não está nos "likes")

    res.status(200).json({
      message: "User skipped successfully"
    });
  } catch (error) {
    console.error("Error disliking user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /likes/sent - Ver likes que você enviou
export async function getSentLikes(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const likes = await prisma.like.findMany({
      where: { fromUserId: userId },
      orderBy: { createdAt: "desc" }
    });

    // Buscar detalhes dos usuários manualmente
    const userIds = likes.map(like => like.toUserId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
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

    const formattedLikes = likes.map(like => {
      const user = users.find(u => u.id === like.toUserId);
      return {
        likedAt: like.createdAt,
        user: user
      };
    });

    res.status(200).json({
      likes: formattedLikes,
      total: formattedLikes.length
    });
  } catch (error) {
    console.error("Error fetching sent likes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /likes/received - Ver quem curtiu você
export async function getReceivedLikes(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const likes = await prisma.like.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: "desc" }
    });

    // Buscar detalhes dos usuários manualmente
    const userIds = likes.map(like => like.fromUserId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
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

    const formattedLikes = likes.map(like => {
      const user = users.find(u => u.id === like.fromUserId);
      return {
        likedAt: like.createdAt,
        user: user
      };
    });

    res.status(200).json({
      likes: formattedLikes,
      total: formattedLikes.length
    });
  } catch (error) {
    console.error("Error fetching received likes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
