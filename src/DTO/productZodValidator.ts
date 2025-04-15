import { z } from "zod";

const createProductZod = z.object({
  name: z
    .string({ message: "Invalid name." })
    .min(3, { message: "Invalid name." })
    .max(30, { message: "Invalid name." }),
  description: z
    .string({ message: "Invalid description." })
    .min(30, { message: "Invalid description." }),
  price: z.number({ message: "Invalid price." }),
  quantity: z
    .number({ message: "Invalid quantity." })
    .min(1, { message: "Invalid quantity." }),
  categoryId: z
    .string({ message: "Invalid category id." })
    .min(24, { message: "Invalid category id." })
    .max(24, { message: "Invalid category id." }),
  supplierId: z
    .string({ message: "Invalid supplier id." })
    .min(24, { message: "Invalid supplier id." })
    .max(24, { message: "Invalid supplier id." }),
});

const getProductsZod = z.object({
  categoryId: z
    .string({ message: "Invalid query category." })
    .max(24, "Invalid query category.")
    .min(24, "Invalid query category.")
    .optional(),
  supplierId: z
    .string({ message: "Invalid query supplier." })
    .max(24, "Invalid query supplier.")
    .min(24, "Invalid query supplier.")
    .optional(),
  price_max: z
    .string({ message: "Invalid query max price." })
    .max(2147483647, "Invalid query max price.")
    .min(0, "Invalid query max price.")
    .optional(),
  price_min: z
    .string({ message: "Invalid query min price." })
    .max(2147483647, "Invalid query min price.")
    .min(0, "Invalid query min price.")
    .optional(),
  offset: z
    .string({ message: "Invalid query offset." })
    .max(2147483647, "Invalid query offset.")
    .min(0, "Invalid query offset.")
    .optional(),
  limit: z
    .string({ message: "Invalid query limit." })
    .max(2147483647, "Invalid query limit.")
    .min(0, "Invalid query limit.")
    .optional(),
});

const getProductZod = z.object({
  id: z
    .string({ message: "Invalid id." })
    .min(24, "Invalid id.")
    .max(24, "Invalid id."),
});

const updateProductZod = z.object({
  id: z
    .string({ message: "Invalid id." })
    .min(24, "Invalid id.")
    .max(24, "Invalid id."),
  name: z
    .string({ message: "Invalid name." })
    .min(3, { message: "Invalid name." })
    .max(30, { message: "Invalid name." }),
  description: z
    .string({ message: "Invalid description." })
    .min(30, { message: "Invalid description." }),
  price: z.number({ message: "Invalid price." }),
  quantity: z
    .number({ message: "Invalid quantity." })
    .min(1, { message: "Invalid quantity." }),
  categoryId: z
    .string({ message: "Invalid category id." })
    .min(24, { message: "Invalid category id." })
    .max(24, { message: "Invalid category id." }),
  supplierId: z
    .string({ message: "Invalid supplier id." })
    .min(24, { message: "Invalid supplier id." })
    .max(24, { message: "Invalid supplier id." }),
});

export { createProductZod, getProductsZod, getProductZod, updateProductZod };
