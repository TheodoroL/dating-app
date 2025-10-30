import type { Request, Response } from "express";
import { prisma } from "../libs/database/prisma.js";

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

// GET /users - Estilo Tinder: retorna usuários que você ainda não curtiu/rejeitou
export async function getDiscoverUsers(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Pegar preferência do usuário logado
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preference: true }
    });
    

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Buscar IDs de usuários que você já interagiu (curtiu OU descurtiu)
    const alreadyInteracted = await prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true }
    });

    const interactedUserIds = alreadyInteracted.map(interaction => interaction.toUserId);

    // Buscar usuários para mostrar
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId, // Não mostrar você mesmo
          notIn: interactedUserIds // Não mostrar quem você já curtiu/descurtiu
        },
        gender: currentUser.preference // Filtrar por preferência
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        dob: true,
        gender: true,
        photos: {
          select: {
            url: true,
            profilePhoto: true
          }
        }
      },
      take: 10 // Limite de usuários por vez
    });

    // Adicionar idade calculada e formatar resposta
    const formattedUsers = users.map(user => ({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      age: calculateAge(user.dob),
      gender: user.gender,
      photos: user.photos,
      profilePhoto: user.photos.find(p => p.profilePhoto)?.url || user.photos[0]?.url
    }));


    res.status(200).json({
      users: formattedUsers,
      total: formattedUsers.length,
      hasMore: formattedUsers.length === 10
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /users/matches - Ver seus matches
export async function getMatches(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }]
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    // Buscar informações dos usuários dos matches
    const matchesWithUserInfo = await Promise.all(
      matches.map(async match => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;

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
          matchedAt: match.createdAt,
          user: {
            id: otherUser.id,
            firstname: otherUser.firstname,
            lastname: otherUser.lastname,
            age: calculateAge(otherUser.dob),
            profilePhoto: otherUser.photos[0]?.url
          },
          lastMessage: match.messages[0] || null
        };
      })
    );

    const validMatches = matchesWithUserInfo.filter(m => m !== null);

    res.status(200).json({
      matches: validMatches,
      total: validMatches.length
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /users/me - Buscar informações do usuário logado
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    
   
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        gender: true,
        preference: true,
        dob: true,
        createdAt: true,
        photos: {
          select: {
            id: true,
            url: true,
            profilePhoto: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        gender: user.gender,
        preference: user.preference,
        age: calculateAge(user.dob),
        memberSince: user.createdAt,
        photos: user.photos,
        profilePhoto: user.photos.find(p => p.profilePhoto)?.url || user.photos[0]?.url || null
      }
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
