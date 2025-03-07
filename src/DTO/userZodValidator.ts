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

export { createAdminZod };
