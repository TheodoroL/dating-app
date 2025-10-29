import type { Request, Response } from "express";
import { prisma } from "../libs/database/prisma.js";

export async function likeUser(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;
    const { userId: targetUserId } = req.params;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        fromUserId: currentUserId,
        toUserId: targetUserId
      }
    });

    if (existingLike) {
      return res.status(409).json({ message: "You already liked this user" });
    }

    await prisma.like.create({
      data: {
        fromUserId: currentUserId,
        toUserId: targetUserId
      }
    });

    const mutualLike = await prisma.like.findFirst({
      where: {
        fromUserId: targetUserId,
        toUserId: currentUserId,
        isLike: true // Só considera match se for like, não dislike
      }
    });

    let match = null;

    if (mutualLike) {
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

export async function dislikeUser(req: Request, res: Response) {
  try {
    const currentUserId = req.user?.id;
    const { userId: targetUserId } = req.params;

    const existingInteraction = await prisma.like.findFirst({
      where: {
        fromUserId: currentUserId,
        toUserId: targetUserId
      }
    });

    if (existingInteraction) {
      return res.status(409).json({ message: "You already interacted with this user" });
    }

    await prisma.like.create({
      data: {
        fromUserId: currentUserId,
        toUserId: targetUserId,
        isLike: false
      }
    });

    res.status(200).json({
      message: "User skipped successfully"
    });
  } catch (error) {
    console.error("Error disliking user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSentLikes(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    const likes = await prisma.like.findMany({
      where: {
        fromUserId: userId,
        isLike: true
      },
      orderBy: { createdAt: "desc" }
    });

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

export async function getReceivedLikes(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    const likes = await prisma.like.findMany({
      where: {
        toUserId: userId,
        isLike: true // Apenas likes, não dislikes
      },
      orderBy: { createdAt: "desc" }
    });

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
