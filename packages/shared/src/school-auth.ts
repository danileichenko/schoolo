import { z } from "zod";

export const registerSchoolRequestSchema = z.object({
  name: z.string().min(1).max(200),
  work_email: z.string().email(),
  password: z.string().min(12),
});

export const signInRequestSchema = z.object({
  work_email: z.string().email(),
  password: z.string().min(1),
});

export const acceptInviteRequestSchema = z.object({
  password: z.string().min(12),
});

export const inviteTeacherRequestSchema = z.object({
  work_email: z.string().email(),
});

export const authSessionResponseSchema = z.object({
  school: z.object({
    id: z.string(),
    name: z.string(),
  }),
  staff: z.object({
    id: z.string(),
    role: z.enum(["school_admin", "teacher"]),
    status: z.enum(["active", "inactive"]),
    work_email: z.string(),
  }),
});

export const errorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
