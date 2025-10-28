import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";

export function zodValidatorMiddleware(zodType: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { success, data, error } = zodType.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ error: error.format() });
    }
    req.body = data;
    next();
  };
}
