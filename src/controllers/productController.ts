import { Request, Response } from "express";
import {
  createProductZod,
  getProductsZod,
  getProductZod,
  updateProductZod,
} from "../DTO/productZodValidator";
import { User } from "../models/userModel";
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
      req.userId as string,
      "addProduct",
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

const getProduct = async (req: Request, res: Response): Promise<any> => {
  //req data validation
  const { id } = req.params;

  const validateData = getProductZod.safeParse({ id });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    const product = await Product.findById(validateData.data.id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "No product found with this id.",
      });
    }

    const category = await Category.findById(product.categoryId);

    if (!category) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    const supplier = await User.findById(product.supplierId);

    if (!supplier) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Product data has been fetched.",
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        categoryId: product.categoryId,
        categoryName: category.name,
        supplierId: product.supplierId,
        supplierName: supplier.name,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const updateProduct = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req data validation
  const { id } = req.params;
  const { name, description, price, quantity, categoryId, supplierId } =
    req.body;

  const validateData = updateProductZod.safeParse({
    id,
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
    const foundProduct = await Product.findById(validateData.data.id);

    if (!foundProduct) {
      return res.status(404).json({
        status: "error",
        message: "No product found with the provided id.",
      });
    }

    if (
      foundProduct.name === validateData.data.name &&
      foundProduct.description === validateData.data.description &&
      foundProduct.price === validateData.data.price &&
      foundProduct.quantity === validateData.data.quantity &&
      foundProduct.categoryId.toString() === validateData.data.categoryId &&
      foundProduct.supplierId.toString() === validateData.data.supplierId
    ) {
      return res.status(409).json({
        status: "error",
        message: "No changes found to update product.",
      });
    }

    if (foundProduct.categoryId.toString() !== validateData.data.categoryId) {
      const foundCategory = await Category.findById(
        validateData.data.categoryId
      );

      if (!foundCategory) {
        return res.status(404).json({
          state: "error",
          message: "No category found with this id.",
        });
      }
    }

    if (foundProduct.supplierId.toString() !== validateData.data.supplierId) {
      const foundSupplier = User.findById(validateData.data.supplierId);

      if (!foundSupplier) {
        return res.status(404).json({
          status: "error",
          message: "No supplier found with this id.",
        });
      }
    }

    const duplicateProductByName = await Product.findOne({
      name: validateData.data.name,
    });

    if (duplicateProductByName) {
      return res.status(404).json({
        status: "error",
        message: "Product already exists with this name.",
      });
    }

    await Product.findByIdAndUpdate(foundProduct._id, {
      name: validateData.data.name,
      description: validateData.data.description,
      price: validateData.data.price,
      quantity: validateData.data.quantity,
      categoryId: validateData.data.categoryId,
      supplierId: validateData.data.supplierId,
    });

    await logger(
      req.userId as string,
      "updateProduct",
      `An admin of id ${req.userId} has updated a product of id ${foundProduct._id}`
    );

    return res.status(200).json({
      status: "success",
      message: "Product has been updated.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const deleteProduct = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req data validation
  const { id } = req.params;

  //get product zod uses the same schema that we would need to validate the id
  const validateData = getProductZod.safeParse({
    id,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    const foundProduct = await Product.findById(validateData.data.id);

    if (!foundProduct) {
      return res.status(404).json({
        status: "error",
        message: "No product found with this id.",
      });
    }

    await Product.findByIdAndDelete(validateData.data.id);

    await logger(
      req.userId as string,
      "removeProduct",
      `An admin of id ${req.userId} has removed a product of id ${validateData.data.id}`
    );

    return res.status(200).json({
      status: "success",
      message: "Product has been deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

export { createProduct, getProducts, getProduct, updateProduct, deleteProduct };
