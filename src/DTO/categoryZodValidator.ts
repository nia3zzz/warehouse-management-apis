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

const getCategoryZod = z.object({
  id: z
    .string({ message: "Must be a valid id." })
    .min(24, "Invalid id provided.")
    .max(24, "Invalid id provided."),
});

export { createCategoryZod, getCategorysZod, getCategoryZod };
