import { z } from "zod";

const createCategoryZod = z.object({
  name: z
    .string({ message: "Invalid name." })
    .min(3, { message: "Invalid name." })
    .max(30, { message: "Invalid name." }),
  description: z
    .string({ message: "Invalid description." })
    .min(30, { message: "Invalid description." }),
});

const getCategorysZod = z.object({
  sortBy: z.enum(["firstToAdd", "lastToAdd", "mostProducts"], {
    errorMap: () => ({ message: "Invalid query." }),
  }),
});

export { createCategoryZod, getCategorysZod };
