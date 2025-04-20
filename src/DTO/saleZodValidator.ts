import { z } from "zod";

const createSaleZod = z.object({
  customerId: z
    .string({ message: "Invalid customer id." })
    .max(24, "Invalid customer id.")
    .min(24, "Invalid customer id."),
  productId: z
    .string({ message: "Invalid product id." })
    .max(24, "Invalid product id.")
    .min(24, "Invalid product id."),
  quantity: z
    .number({ message: "Invalid quanity." })
    .min(1, "Invalid quanity."),
});

export { createSaleZod };
