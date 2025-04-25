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

const getSalesDataZod = z.object({
  limit: z
    .string({ message: "Invalid query limit." })
    .min(0, "Invalid query limit.")
    .optional(),
  offSet: z
    .string({ message: "Invalid query off set." })
    .min(0, "Invalid query off set.")
    .optional(),
  productId: z
    .string({ message: "Invalid query product id." })
    .min(24, "Invalid query product id.")
    .max(24, "Invalid query product id.")
    .optional(),
  sortByPrice: z
    .union([z.literal("true"), z.literal("false")], {
      errorMap: () => ({
        message: "Invalid query sort by price.",
      }),
    })
    .optional(),
});

export { createSaleZod, getSalesDataZod };
