import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string(),
  price: z.number().min(1, "Required"),
  imageUrl: z.string(),
  categoryId: z.string().min(1, "Required"),
  content: z.string(),
  stock: z.number().default(0).optional(),
  isArchived: z.boolean().default(false).optional(),
});
