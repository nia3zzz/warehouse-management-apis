import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import {
  createCategory,
  getCategory,
  getCategorys,
  updateCategory,
} from "../controllers/categoryController";

const router: Router = express.Router();

//category routes

//create a category
router.post("/", authHandler, createCategory);
//get an array of categorys
router.get("/", authHandler, getCategorys);
//get data of a category
router.get("/:id", authHandler, getCategory);
//update an existing route
router.put("/:id", authHandler, updateCategory);

export default router;
