import { z } from "zod";

export const addressSchema = z.object({
  receiver_name: z.string().min(1, "Required"),
  phone_number: z
    .string()
    .min(9, "Minimun 9 digit")
    .max(15, "Max 15 digit")
    .regex(/^8[1-9][0-9]{7,11}$/, "Number must start with 8 without 0"),
  label: z.string().min(1, "Required"),
  province: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  subdistrict: z.string().min(1, "Required"),
  postal_code: z
    .string()
    .min(1, "Required")
    .max(5, "It is not allowed to enter more than 5 characters."),
  complete_address: z.string().min(1, "Required").max(200, {
    message: "It is not allowed to enter more than 200 characters.",
  }),
  mainAddress: z.boolean().default(false).optional(),
});
