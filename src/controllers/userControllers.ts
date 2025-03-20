import { Request, Response } from "express";
import {
  approveAdminZod,
  createAdminZod,
  loginAdminZod,
  verifyAdminEmailZod,
} from "../DTO/userZodValidator";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import cloudinary from "../utils/cloudinarySetup";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/nodeMailer";
import { customExpressRequest } from "../middlewares/authHandler";
import emailVerifyModel from "../models/emailVerifyModel";
import logger from "../utils/logger";

interface cloudinaryUploadResponse {
  secure_url: string;
}

const createAdmin = async (req: Request, res: Response): Promise<any> => {
  const { name, email, phoneNumber, password } = req.body;
  const profile_Picture = req.file;

  //data validation using zod
  const validateData = createAdminZod.safeParse({
    name,
    email,
    phoneNumber,
    password,
    profile_Picture,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }
  try {
    //check duplicates
    const duplicateEmail = await User.findOne({
      email: validateData.data.email,
    });
    if (duplicateEmail) {
      return res.status(409).json({
        status: "error",
        message: "Email already exists",
      });
    }

    const duplicatePhoneNumber = await User.findOne({
      phoneNumber: validateData.data.phoneNumber,
    });
    if (duplicatePhoneNumber) {
      return res.status(409).json({
        status: "error",
        message: "Phone number already exists",
      });
    }
    //hash password
    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    //upload picture to cloudinary
    const profile_PictureURL: cloudinaryUploadResponse =
      await cloudinary.uploader.upload(validateData.data.profile_Picture.path, {
        folder: "warehouse_management_system/profile_pictures",
      });

    //create admin
    await User.create({
      name: validateData.data.name,
      email: validateData.data.email,
      phoneNumber: validateData.data.phoneNumber,
      password: hashedPassword,
      profile_Picture: profile_PictureURL.secure_url,
      role: "admin",
    });

    return res.status(201).json({
      status: "success",
      message: "Admin created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const loginAdmin = async (req: Request, res: Response): Promise<any> => {
  const { email, phoneNumber, password } = req.body;

  //data validation using zod
  const validateData = loginAdminZod.safeParse({
    email,
    phoneNumber,
    password,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }
  try {
    //check user exists
    const checkUserExists = await User.findOne({
      $or: [
        { email: validateData.data.email },
        { phoneNumber: validateData.data.phoneNumber },
      ],
    });

    if (!checkUserExists) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    //authenticate password
    const authenticatePassword: boolean = await bcrypt.compare(
      validateData.data.password,
      checkUserExists.password
    );

    if (!authenticatePassword) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    //check if admin email is verified

    if (!checkUserExists.isVerified) {
      const secureId = await sendEmail(
        {
          _id: checkUserExists._id.toString(),
          email: checkUserExists.email,
        },
        "emailVerification"
      );

      return res.status(401).json({
        status: "success",
        message: "Verification code has been sent, check email.",
        secureId: secureId ?? "",
      });
    }

    //check if admin is authenticated
    if (!checkUserExists.isApproved) {
      return res.status(401).json({
        status: "error",
        message: "You are not authenticated.",
      });
    }
    //send cookie
    const token = jwt.sign(
      {
        id: checkUserExists._id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      domain: "localhost",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
    });

    await logger(
      checkUserExists._id.toString(),
      "loginAdmin",
      `An Admin of id ${checkUserExists._id} has logged in.`
    );

    return res.status(200).json({
      state: "success",
      message: "Admin logged in successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getRequestsAdmin = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  try {
    const adminRequests = await User.find({
      $and: [
        {
          role: "admin",
        },
        {
          isVerified: true,
        },
        {
          isApproved: false,
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      message: `New ${adminRequests.length} admin requests found`,
      data: adminRequests,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const approveRemoveAdmin = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const { approve } = req.body;
  const validateData = approveAdminZod.safeParse({
    id,
    approve,
  });

  //validate data
  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //if user exist & auth checks
    const foundAdmin = await User.findById({ _id: validateData.data.id });
    if (!foundAdmin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }
    if (!foundAdmin.isVerified && foundAdmin.role !== "admin") {
      return res.status(404).json({
        status: "error",
        message: "Admin not found",
      });
    }

    //update and send email
    if (!foundAdmin.isApproved) {
      await User.findByIdAndUpdate(id, {
        isApproved: true,
      });

      await sendEmail({ email: foundAdmin.email }, "appovedNotification");

      await logger(
        req.userId ?? "",
        "newAdminAdded",
        `An Admin of id ${req.userId ?? ""} has approved a new admin of id ${
          foundAdmin._id
        }.`
      );

      return res.status(200).json({
        state: "success",
        message: "New admin has been added.",
      });
    } else if (foundAdmin.isApproved) {
      await User.findByIdAndDelete(id);

      await sendEmail({ email: foundAdmin.email }, "deleteAccount");

      await logger(
        req.userId ?? "",
        "removeAdmin",
        `An Admin of id ${req.userId ?? ""} has removed an admin of id ${
          foundAdmin._id
        }.`
      );

      return res.status(200).json({
        status: "success",
        message: "Admin has been removed.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const verifyAdminEmail = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id;
  const { verificationCode } = req.body;

  //type validation
  const validateData = verifyAdminEmailZod.safeParse({
    id,
    verificationCode,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //check code exists
    const hashCodeDocument = await emailVerifyModel.findById({
      _id: id,
    });

    if (!hashCodeDocument) {
      return res.status(404).json({
        status: "error",
        message: "Session is invalid or expired.",
      });
    }

    //validate against hashed code
    const isCodeValid: boolean = await bcrypt.compare(
      validateData.data.verificationCode,
      hashCodeDocument.hashedCode
    );

    if (!isCodeValid) {
      return res.status(401).json({
        status: "error",
        message: "Verification code is incorrect.",
      });
    }

    //update user as the user email is verified
    await User.findByIdAndUpdate(hashCodeDocument.author, {
      isVerified: true,
    });

    return res.status(200).json({
      status: "success",
      message: "Your email has been verified.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const logoutAdmin = async (req: customExpressRequest, res: Response): Promise<any> => {
  try {
    res.clearCookie("token");

    await logger(
      req.userId ?? "",
      "logoutAdmin",
      `An Admin of id ${req.userId ?? ""} has logged out.`
    );

    return res.status(200).json({
      status: "success",
      message: "You are logged out.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

export {
  createAdmin,
  loginAdmin,
  getRequestsAdmin,
  approveRemoveAdmin,
  verifyAdminEmail,
  logoutAdmin,
};
