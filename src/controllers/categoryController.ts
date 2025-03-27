import { Response } from "express";
import { customExpressRequest } from "../middlewares/authHandler";
import { createCategoryZod } from "../DTO/categoryZodValidator";
import { Category } from "../models/categoryModel";
import logger from "../utils/logger";

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

export { createCategory };
