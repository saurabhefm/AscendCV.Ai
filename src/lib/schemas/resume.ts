import { z } from 'zod';

export const ResumeDataSchema = z.object({
  basics: z.object({
    name: z.string(),
    email: z.string().email().or(z.string()),
    phone: z.string(),
    location: z.string(),
  }),
  summary: z.string().optional(),
  experience: z.array(
    z.object({
      id: z.string(),
      company: z.string(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      isCurrent: z.boolean(),
      bullets: z.array(z.string()).describe("These bullets MUST be rewritten into the STAR format: Situation, Task, Action, Result."),
    })
  ),
});
