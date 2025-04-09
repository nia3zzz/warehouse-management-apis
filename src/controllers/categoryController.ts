import { Request, Response } from "express";
import { customExpressRequest } from "../middlewares/authHandler";
import {
  createCategoryZod,
  getCategorysZod,
  getCategoryZod,
  updateCategoryZod,
} from "../DTO/categoryZodValidator";
import { Category } from "../models/categoryModel";
import logger from "../utils/logger";
import { Product } from "../models/productModel";

const createCategory = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req data validation
  const { name, description } = req.body;

  const validateData = createCategoryZod.safeParse({
    name,
    description,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    const checkCategoryExists = await Category.findOne({
      name: validateData.data.name,
    });

    if (checkCategoryExists) {
      return res.status(404).json({
        status: "error",
        message: "Category with this name already exists.",
      });
    }

    const categoryDocument = await Category.create({
      name: validateData.data.name,
      description: validateData.data.description,
    });

    await logger(
      req.userId ?? "",
      "createCategory",
      `An admin of id ${req.userId} has created a category of id ${categoryDocument._id}`
    );

    return res.status(201).json({
      status: "success",
      message: "Category has been added.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const getCategorys = async (req: Request, res: Response): Promise<any> => {
  //req query validation
  const { sortBy } = req.query;

  const validateQuery = getCategorysZod.safeParse({
    sortBy: sortBy,
  });

  if (!validateQuery.success) {
    return res.status(400).json({
      status: "error",
      message: validateQuery.error.errors[0].message,
    });
  }

  try {
    if (validateQuery.data.sortBy === "firstToAdd") {
      const categorys = await Category.find().sort({ createdAt: 1 });

      return res.status(200).json({
        state: "success",
        message: "Data has been found.",
        data: categorys.map((category) => ({
          _id: category._id,
          name: category.name,
        })),
      });
    }

    if (validateQuery.data.sortBy === "lastToAdd") {
      const categorys = await Category.find().sort({ createdAt: -1 });

      return res.status(200).json({
        state: "success",
        message: "Data has been found.",
        data: categorys.map((category) => ({
          _id: category._id,
          name: category.name,
        })),
      });
    }

    if (validateQuery.data.sortBy === "mostProducts") {
      const categoryStats = await Product.aggregate([
        {
          $group: {
            _id: "$categoryId",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const categoryIds = categoryStats.map((cat) => cat._id);

      const categories = await Category.find({ _id: { $in: categoryIds } });

      const result = categoryStats.map((stat) => {
        const category = categories.find(
          (cat) => cat._id.toString() === stat._id.toString()
        );
        return {
          _id: stat._id,
          name: category?.name || "Unknown Category",
        };
      });

      return res.status(200).json({
        state: "success",
        message: "Data has been found.",
        data: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const getCategory = async (req: Request, res: Response): Promise<any> => {
  //req body validation
  const { id } = req.params;

  const validateData = getCategoryZod.safeParse({
    id,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    const categoryDocument = await Category.findById(validateData.data.id);

    if (!categoryDocument) {
      return res.status(404).json({
        status: "error",
        message: "No category found with this id.",
      });
    }

    const foundProducts = await Product.find({
      categoryId: categoryDocument._id,
    });

    return res.status(200).json({
      status: "success",
      message: "Data has been fetched.",
      data: {
        id: categoryDocument._id,
        name: categoryDocument.name,
        description: categoryDocument.description,
        products: foundProducts.map((product) => ({
          id: product.id,
          name: product.name,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const updateCategory = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req data validation
  const { id } = req.params;
  const { name, description } = req.body;

  const validateData = updateCategoryZod.safeParse({
    id,
    name,
    description,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    const foundCategory = await Category.findById(validateData.data.id);

    if (!foundCategory) {
      return res.status(404).json({
        status: "error",
        message: "No category found with this id.",
      });
    }

    if (
      foundCategory.name === validateData.data.name &&
      foundCategory.description === validateData.data.description
    ) {
      return res.status(409).json({
        status: "error",
        message: "No data found to update the category.",
      });
    }

    const checkCategoryExists = await Category.findOne({
      name: validateData.data.name,
    });

    if (checkCategoryExists) {
      return res.status(409).json({
        status: "error",
        message: "Category with this name already exists.",
      });
    }

    await Category.findByIdAndUpdate(validateData.data.id, {
      name: validateData.data.name,
      description: validateData.data.description,
    });

    await logger(
      req.userId ?? "",
      "updateCategory",
      `An admin of id ${req.userId} has updated a category of id ${foundCategory._id}.`
    );

    return res.status(200).json({
      status: "success",
      message: "Category has been updated.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

export { createCategory, getCategorys, getCategory, updateCategory };
