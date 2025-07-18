import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  color: z.string().optional(),
  parent: z.string().optional(),
});
