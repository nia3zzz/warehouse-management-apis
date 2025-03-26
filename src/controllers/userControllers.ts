import { Request, Response } from "express";
import {
  addSupplyerZod,
  approveAdminZod,
  changePasswordZod,
  createAdminZod,
  deleteSupplyerZod,
  loginAdminZod,
  updateSupplyerZod,
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

//admin controller functions
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
      data: adminRequests.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profile_Picture: user.profile_Picture,
      })),
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

const logoutAdmin = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
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

const requestChangePassword = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  try {
    //send code to email
    const foundUser = await User.findById(req.userId);

    if (!foundUser) {
      return res.status(409).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    await sendEmail(
      { _id: foundUser._id.toString(), email: foundUser.email },
      "changePassword"
    );

    return res.status(200).json({
      status: "success",
      message: "Code has been sent to your email.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const changePassword = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  const { verificationCode, newPassword, confirmPassword } = req.body;

  //req data validation
  const validateData = changePasswordZod.safeParse({
    verificationCode,
    newPassword,
    confirmPassword,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  //verify hash code is authentic
  try {
    const emailVerificationDocument = await emailVerifyModel.findOne({
      author: req.userId,
    });

    if (!emailVerificationDocument) {
      return res.status(404).json({
        status: "error",
        message: "Code has expired or is invalid.",
      });
    }

    const isCodeValid = await bcrypt.compare(
      validateData.data.verificationCode,
      emailVerificationDocument.hashedCode
    );

    if (!isCodeValid) {
      return res.status(409).json({
        status: "error",
        message: "Code has expired or is invalid.",
      });
    }

    //update the user password
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(validateData.data.newPassword, salt);

    if (req.userId) {
      await User.findOneAndUpdate(
        { _id: req.userId },
        { password: newPassword }
      );
    } else {
      return res.status(409).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    return res.status(200).json({
      status: "sucess",
      message: "Your password has been updated.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

//supplier controller functions
const addSupplyer = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req data validation
  const { name, phoneNumber, house, street, city, state, postCode, country } =
    req.body;

  const validateData = addSupplyerZod.safeParse({
    name,
    phoneNumber,
    house,
    street,
    city,
    state,
    postCode,
    country,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //check duplicate supplyer
    const checkDuplicateSupplier = await User.findOne({
      phoneNumber: validateData.data.phoneNumber,
    });

    if (checkDuplicateSupplier) {
      return res.status(409).json({
        status: "error",
        message: "This phone number is already in use.",
      });
    }

    //save the supplyer
    const supplyer = await User.create({
      name: validateData.data.name,
      phoneNumber: validateData.data.phoneNumber,
      address: {
        house: validateData.data.house,
        street: validateData.data.street,
        city: validateData.data.city,
        state: validateData.data.state,
        postCode: validateData.data.postCode,
        country: validateData.data.country,
      },
      role: "supplier",
    });

    await logger(
      req.userId ?? "",
      "addSupplyer",
      `An admin of id ${req.userId} has added an supplyer of id ${supplyer._id}`
    );

    return res.status(201).json({
      status: "success",
      message: "Supplyer has been added.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const getSupplyers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { skip, limit } = req.query;

    const supplyers = await User.find({
      role: "supplier",
    })
      .skip(Number(skip) || 0)
      .limit(Number(limit) || 0);

    return res.status(200).json({
      status: "success",
      message: `Total ${supplyers.length} supplyers found.`,
      data: supplyers.map((supplyer) => ({
        _id: supplyer._id,
        name: supplyer.name,
        phoneNumber: supplyer.phoneNumber,
        profile_Picture: supplyer.profile_Picture,
        address:supplyer.address
      })),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const updateSupplyer = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req data validation
  const { supplyerId } = req.params;
  const { name, phoneNumber, house, street, city, state, postCode, country } =
    req.body;

  const validateData = updateSupplyerZod.safeParse({
    supplyerId,
    name,
    phoneNumber,
    house,
    street,
    city,
    state,
    postCode,
    country,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }
  try {
    //check if the supplyer exists
    const foundSupplyer = await User.findById(validateData.data.supplyerId);

    if (!foundSupplyer || foundSupplyer.role !== "supplier") {
      return res.status(404).json({
        status: "error",
        message: "Supppler was not found.",
      });
    }

    //check for changes
    if (
      foundSupplyer.name === validateData.data.name &&
      foundSupplyer.phoneNumber === Number(validateData.data.phoneNumber) &&
      foundSupplyer.address.house === validateData.data.house &&
      foundSupplyer.address.street === validateData.data.street &&
      foundSupplyer.address.city === validateData.data.city &&
      foundSupplyer.address.state === validateData.data.state &&
      foundSupplyer.address.postCode === Number(validateData.data.postCode) &&
      foundSupplyer.address.country === validateData.data.country
    ) {
      return res.status(409).json({
        status: "success",
        message: "No changes found to update.",
      });
    }

    //update the supplyer
    const updatedSupplyer = await User.findByIdAndUpdate(
      validateData.data.supplyerId,
      {
        name: validateData.data.name,
        phoneNumber: validateData.data.phoneNumber,
        address: {
          house: validateData.data.house,
          street: validateData.data.street,
          city: validateData.data.city,
          state: validateData.data.state,
          postCode: Number(validateData.data.postCode),
          country: validateData.data.country,
        },
      }
    );

    await logger(
      req.userId ?? "",
      "updateSupplyer",
      `An admin of id ${req.userId} has updated a supplyer of id ${updatedSupplyer?._id}`
    );

    return res.status(200).json({
      status: "error",
      message: "Supplyer has been updated.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const deleteSupplyer = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //data validation
  const { supplyerId } = req.params;

  const validateData = deleteSupplyerZod.safeParse({
    supplyerId,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //check supplyer exists
    const foundSupplyer = await User.findById(validateData.data.supplyerId);

    if (!foundSupplyer) {
      return res.status(404).json({
        status: "error",
        message: "No supplyer found with the provided id",
      });
    }

    //delete supplyer

    await User.findByIdAndDelete(validateData.data.supplyerId);

    await logger(
      req.userId ?? "",
      "deleteSupplyer",
      `An admin of id ${req.userId} has deleted a supplyer of id ${supplyerId}`
    );

    return res.status(200).json({
      status: "success",
      message: "Supplyer has been deleted.",
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
  requestChangePassword,
  changePassword,
  addSupplyer,
  getSupplyers,
  updateSupplyer,
  deleteSupplyer,
};
