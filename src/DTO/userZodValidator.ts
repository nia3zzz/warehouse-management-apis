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

const verifyAdminEmailZod = z.object({
  id: z
    .string({ message: "Must be a valid id." })
    .min(24, "Invalid id provided.")
    .max(24, "Invalid id provided."),
  verificationCode: z
    .string({ message: "Must be valid type." })
    .min(6, "Invalid verification code provided.")
    .max(6, "Invalid verification code provided."),
});

const changePasswordZod = z
  .object({
    verificationCode: z
      .string({ message: "Verification code is required." })
      .min(6, "Invalid verification code.")
      .max(6, "Invalid verification code."),
    newPassword: z
      .string({ message: "New password is required." })
      .min(6, "New password is invalid."),
    confirmPassword: z
      .string({ message: "Confirm password is required." })
      .min(6, "Confirm password is invalid."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const addSupplierZod = z.object({
  name: z
    .string({ message: "Invalid name." })
    .min(2, { message: "Invalid name." })
    .max(30, { message: "Invalid name." }),
  phoneNumber: z
    .string({ message: "Invalid phone number." })
    .min(11, { message: "Invalid phone number." })
    .max(11, { message: "Invalid phone number." }),
  house: z
    .string({ message: "Invalid house." })
    .min(1, { message: "Invalid house." }),
  street: z
    .string({ message: "Invalid street." })
    .min(1, { message: "Invalid street." }),
  city: z
    .string({ message: "Invalid city." })
    .min(1, { message: "Invalid city." }),
  state: z
    .string({ message: "Invalid state." })
    .min(1, { message: "Invalid state." }),
  postCode: z
    .string({ message: "Invalid postcode." })
    .min(4, { message: "Invalid postcode." })
    .max(10, { message: "Invalid postcode." })
    .regex(/^\d+$/, { message: "Invalid postcode." }),
  country: z
    .string({ message: "Invalid country." })
    .min(1, { message: "Invalid country." }),
});

const updateSupplierZod = z.object({
  supplierId: z
    .string({ message: "Must be a valid id." })
    .min(24, "Invalid id provided.")
    .max(24, "Invalid id provided."),
  name: z
    .string({ message: "Invalid name." })
    .min(2, { message: "Invalid name." })
    .max(30, { message: "Invalid name." }),
  phoneNumber: z
    .string({ message: "Invalid phone number." })
    .min(11, { message: "Invalid phone number." })
    .max(11, { message: "Invalid phone number." }),
  house: z
    .string({ message: "Invalid house." })
    .min(1, { message: "Invalid house." }),
  street: z
    .string({ message: "Invalid street." })
    .min(1, { message: "Invalid street." }),
  city: z
    .string({ message: "Invalid city." })
    .min(1, { message: "Invalid city." }),
  state: z
    .string({ message: "Invalid state." })
    .min(1, { message: "Invalid state." }),
  postCode: z
    .string({ message: "Invalid postcode." })
    .min(4, { message: "Invalid postcode." })
    .max(10, { message: "Invalid postcode." })
    .regex(/^\d+$/, { message: "Invalid postcode." }),
  country: z
    .string({ message: "Invalid country." })
    .min(1, { message: "Invalid country." }),
});

const deleteSupplierZod = z.object({
  supplierId: z
    .string({ message: "Must be a valid id." })
    .min(24, "Invalid id provided.")
    .max(24, "Invalid id provided."),
});

const createCustomerZod = z.object({
  name: z
    .string({ message: "Invalid name." })
    .min(2, { message: "Invalid name." })
    .max(30, { message: "Invalid name." }),
  phoneNumber: z
    .string({ message: "Invalid phone number." })
    .min(11, { message: "Invalid phone number." })
    .max(11, { message: "Invalid phone number." }),
  house: z
    .string({ message: "Invalid house." })
    .min(1, { message: "Invalid house." }),
  street: z
    .string({ message: "Invalid street." })
    .min(1, { message: "Invalid street." }),
  city: z
    .string({ message: "Invalid city." })
    .min(1, { message: "Invalid city." }),
  state: z
    .string({ message: "Invalid state." })
    .min(1, { message: "Invalid state." }),
  postCode: z
    .string({ message: "Invalid postcode." })
    .min(4, { message: "Invalid postcode." })
    .max(10, { message: "Invalid postcode." })
    .regex(/^\d+$/, { message: "Invalid postcode." }),
  country: z
    .string({ message: "Invalid country." })
    .min(1, { message: "Invalid country." }),
});

const updateCustomerZod = z.object({
  id: z
    .string({ message: "Must be a valid id." })
    .min(24, "Invalid id provided.")
    .max(24, "Invalid id provided."),
  name: z
    .string({ message: "Invalid name." })
    .min(2, { message: "Invalid name." })
    .max(30, { message: "Invalid name." }),
  phoneNumber: z
    .string({ message: "Invalid phone number." })
    .min(11, { message: "Invalid phone number." })
    .max(11, { message: "Invalid phone number." }),
  house: z
    .string({ message: "Invalid house." })
    .min(1, { message: "Invalid house." }),
  street: z
    .string({ message: "Invalid street." })
    .min(1, { message: "Invalid street." }),
  city: z
    .string({ message: "Invalid city." })
    .min(1, { message: "Invalid city." }),
  state: z
    .string({ message: "Invalid state." })
    .min(1, { message: "Invalid state." }),
  postCode: z
    .string({ message: "Invalid postcode." })
    .min(4, { message: "Invalid postcode." })
    .max(10, { message: "Invalid postcode." })
    .regex(/^\d+$/, { message: "Invalid postcode." }),
  country: z
    .string({ message: "Invalid country." })
    .min(1, { message: "Invalid country." }),
});

const getCustomersZod = z.object({
  mostSoldTo: z
    .union([z.literal("true"), z.literal("false")], {
      errorMap: () => ({
        message: "Invalid query most sold to.",
      }),
    })
    .optional(),
  offSet: z
    .string({ message: "Invalid query offset." })
    .min(0, "Invalid query offset.")
    .optional(),
  limit: z
    .string({ message: "Invalid query limit." })
    .min(0, "Invalid query limit.")
    .optional(),
});

export {
  createAdminZod,
  loginAdminZod,
  approveAdminZod,
  verifyAdminEmailZod,
  changePasswordZod,
  addSupplierZod,
  updateSupplierZod,
  deleteSupplierZod,
  createCustomerZod,
  updateCustomerZod,
  getCustomersZod,
};
