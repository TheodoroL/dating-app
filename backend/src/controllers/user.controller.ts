import type {Request, Response} from "express"
import {prisma} from "../libs/database/prisma.js"


export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                age: true,
            }
        });

        res.status(200).json(users);
    } catch {
        res.status(500).json({message: "Internal server error"})
    }
}