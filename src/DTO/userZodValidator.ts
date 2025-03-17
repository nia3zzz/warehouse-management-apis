import z from "zod";

const createAdminZod = z.object({
  name: z
    .string({ message: "Invalid name." })
    .min(2, { message: "Invalid name." })
    .max(30, { message: "Invalid name." }),

  email: z
    .string({ message: "Invalid email." })
    .email({ message: "Invalid email." }),

  phoneNumber: z
    .string({ message: "Invalid phone number." })
    .min(11, { message: "Invalid phone number." })
    .max(11, { message: "Invalid phone number." }),

  password: z
    .string({ message: "Invalid password." })
    .min(6, { message: "Password must be at least 6 characters long." }),

  profile_Picture: z.object({
    fieldname: z.string().min(1, "Fieldname is required."),
    originalname: z.string().min(1, "Original name is required."),
    encoding: z.string().min(1, "Encoding is required."),
    mimetype: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"], {
      message:
        "Invalid mimetype. Allowed: image/jpeg, image/png, image/gif, image/webp.",
    }),
    destination: z.string().min(1, "Destination path is required."),
    filename: z.string().min(1, "Filename is required."),
    path: z.string().min(1, "File path is required."),
    size: z
      .number()
      .positive("Size must be a positive number.")
      .max(5 * 1024 * 1024, "File size must not exceed 5MB."),
  }),
});

const loginAdminZod = z
  .object({
    email: z.string({}).optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, "Password is required of 6 characters."),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "At least one field must be provided.",
  });

const approveAdminZod = z.object({
  id: z
    .string({ message: "Must be a valid id." })
    .min(24, "Invalid id provided.")
    .max(24, "Invalid id provided."),
  approve: z.boolean({ message: "Must be valid type." }),
});

export { createAdminZod, loginAdminZod, approveAdminZod };
