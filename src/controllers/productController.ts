import { Request, Response } from "express";
import { createProductZod, getProductsZod } from "../DTO/productZodValidator";
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

const getProducts = async (req: Request, res: Response): Promise<any> => {
  //req query validation
  const { categoryId, supplierId, price_max, price_min, offset, limit } =
    req.query;

  const validateQuery = getProductsZod.safeParse({
    categoryId,
    supplierId,
    price_max,
    price_min,
    offset,
    limit,
  });

  if (!validateQuery.success) {
    return res.status(400).json({
      status: "error",
      message: validateQuery.error.errors[0].message,
    });
  }

  try {
    const filter: Record<string, any> = {};

    if (validateQuery.data.categoryId != null) {
      filter.categoryId = validateQuery.data.categoryId;
    }

    if (validateQuery.data.supplierId != null) {
      filter.supplierId = validateQuery.data.supplierId;
    }

    if (
      validateQuery.data.price_min != null ||
      validateQuery.data.price_max != null
    ) {
      const min = Number(validateQuery.data.price_min);
      const max = Number(validateQuery.data.price_max);

      filter.price = {
        $gte: !isNaN(min) ? min : 0,
        $lte: !isNaN(max) ? max : 2147483647,
      };
    }

    const products = await Product.find(filter)
      .skip(Number(validateQuery.data.offset) ?? 0)
      .limit(Number(validateQuery.data.limit) ?? 0)
      .sort({ price: 1 });

    const categories = await Category.find({}, "_id name");
    const categoryMap: Record<string, string> = {};
    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    const suppliers = await User.find(
      {
        role: "supplier",
      },
      "_id name"
    );
    const supplierMap: Record<string, string> = {};
    suppliers.forEach((supp) => {
      supplierMap[supp._id.toString()] = supp.name;
    });

    return res.status(200).json({
      status: "success",
      message: `${products.length} products has been fetched.`,
      data: products.map((product) => ({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        categoryId: product.categoryId,
        categoryName: categoryMap[product.categoryId.toString()] || "Unknown",
        supplierId: product.supplierId,
        supplierName: supplierMap[product.supplierId.toString()] || "Unknown",
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

// const getProduct =

export { createProduct, getProducts };
