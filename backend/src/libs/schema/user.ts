import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 6 characters long"),
  age: z.number().min(18, "You must be at least 18 years old"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"])
});

export const UserLoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 6 characters long")
});
export type User = z.infer<typeof UserSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
