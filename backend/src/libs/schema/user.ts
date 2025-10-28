import { z } from "zod";

export const UserSchema = z.object({
  firstname: z.string().min(2, "First name is required"),
  lastname: z.string().min(2, "Last name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  dob: z
    .string()
    .refine(dateStr => !Number.isNaN(Date.parse(dateStr)), {
      message: "Invalid date format"
    })
    .refine(
      dateStr => {
        const birthDate = new Date(dateStr);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // Ajusta idade se ainda não fez aniversário este ano
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          return age - 1 >= 18;
        }
        return age >= 18;
      },
      {
        message: "You must be at least 18 years old"
      }
    )
    .transform(dateStr => new Date(dateStr)),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  preference: z.enum(["MALE", "FEMALE", "OTHER"])
});

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export type User = z.infer<typeof UserSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
