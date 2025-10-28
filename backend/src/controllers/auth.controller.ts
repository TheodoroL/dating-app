import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import fs from "node:fs/promises";
import { comparePassword, hashPassword } from "../libs/bcrypt/bycript.js";
import { prisma } from "../libs/database/prisma.js";
import { env } from "../libs/schema/env.js";
import type { User, UserLogin } from "../libs/schema/user.js";
export async function createUser(req: Request<unknown, Record<string, never>, User>, res: Response) {
  const { firstname, lastname, email, dob, password, gender, preference } = req.body;

  try {
    const findedUser = await prisma.user.findUnique({ where: { email } });
    if (findedUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashPasword = await hashPassword(password);

    // Criar o usuário primeiro
    const newUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        dob,
        password: hashPasword,
        gender,
        preference
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        dob: true,
        gender: true
      }
    });

    // Se houver upload de foto, salvar no banco
    if (req.file) {
      const photoPath = `/uploads/payload/${req.file.filename}`;

      await prisma.photo.create({
        data: {
          url: photoPath,
          userId: newUser.id,
          profilePhoto: true // Primeira foto é sempre foto de perfil
        }
      });
    }

    res.status(201).json(newUser);
  } catch (error) {
    // Se houver erro e já foi feito upload, deletar o arquivo
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch {
        // Ignorar erro ao deletar arquivo
      }
    }

    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function loginUser(req: Request<unknown, Record<string, never>, UserLogin>, res: Response) {
  const { email, password } = req.body;
  try {
    const findedUser = await prisma.user.findUnique({ where: { email } });
    if (!findedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await comparePassword(password, findedUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.header(
      "Authorization",
      `Bearer ${jwt.sign({ id: findedUser.id, email: findedUser.email }, env.JWT_SECRET, { expiresIn: "1d" })}`
    );

    res.status(200).json({ message: "Login successful" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}
