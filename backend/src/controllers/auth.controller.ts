import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../libs/bcrypt/bycript.js";
import { prisma } from "../libs/database/prisma.js";
import { env } from "../libs/schema/env.js";
import type { User, UserLogin } from "../libs/schema/user.js";

export async function createUser(req: Request<unknown, {}, User>, res: Response) {
  const { name, email, age, password, gender } = req.body;
  try {
    const findedUser = await prisma.user.findUnique({ where: { email } });
    if (findedUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashPasword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        age,
        password: hashPasword,
        gender
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true
      }
    });

    res.status(201).json(newUser);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function loginUser(req: Request<unknown, {}, UserLogin>, res: Response) {
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
      `Bearer ${jwt.sign({ id: findedUser.id, email: findedUser.email }, env.JWT_SECRET, { expiresIn: "1h" })}`
    );

    res.status(200).json({ message: "Login successful" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}
