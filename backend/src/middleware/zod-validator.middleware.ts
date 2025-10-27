import type { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export function zodValidatorMiddleware(zodType: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { success, error } = zodType.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: error.format });
    }
    next();
  };
}
