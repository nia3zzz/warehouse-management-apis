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

export { createProductZod };
