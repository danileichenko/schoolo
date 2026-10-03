import { z } from "zod";

/** Placeholder health payload shared across clients. */
export const healthSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
});

export type HealthPayload = z.infer<typeof healthSchema>;

export {
  acceptInviteRequestSchema,
  authSessionResponseSchema,
  errorBodySchema,
  inviteTeacherRequestSchema,
  registerSchoolRequestSchema,
  signInRequestSchema,
} from "./school-auth.js";
