import { Response } from "express";
import { createProductZod } from "../DTO/productZodValidator";
import User from "../models/userModel";
import { Product } from "../models/productModel";
import { Category } from "../models/categoryModel";
import logger from "../utils/logger";
import { customExpressRequest } from "../middlewares/authHandler";

const createProduct = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req body validation
  const { name, description, price, quantity, categoryId, supplierId } =
    req.body;

  const validateData = createProductZod.safeParse({
    name,
    description,
    price,
    quantity,
    categoryId,
    supplierId,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //check data exists
    const duplicateProductByName = await Product.findOne({
      name: validateData.data.name,
    });

    if (duplicateProductByName) {
      return res.status(404).json({
        status: "error",
        message: "Product already exists with this name.",
      });
    }

    const checkCategoryExists = await Category.findById(
      validateData.data.categoryId
    );

    if (!checkCategoryExists) {
      return res.status(404).json({
        status: "error",
        message: "No category found with the id.",
      });
    }

    const checkSupplierExists = await User.findOne({
      $and: [
        {
          _id: validateData.data.supplierId,
          role: "supplier",
        },
      ],
    });

    if (!checkSupplierExists) {
      return res.status(404).json({
        status: "error",
        message: "No supplier found with the id.",
      });
    }

    //create product & logger
    const productDocument = await Product.create({
      name: validateData.data.name,
      description: validateData.data.description,
      price: validateData.data.price,
      quantity: validateData.data.quantity,
      categoryId: validateData.data.categoryId,
      supplierId: validateData.data.supplierId,
    });

    await logger(
      req.userId ?? "",
      "addProducts",
      `An admin of id ${req.userId} has added a post of id ${productDocument._id}`
    );

    return res.status(201).json({
      status: "success",
      message: "Product has been added.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

export { createProduct };
