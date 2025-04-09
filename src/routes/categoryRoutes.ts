import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import {
  createCategory,
  getCategory,
  getCategorys,
} from "../controllers/categoryController";

const router: Router = express.Router();

//category routes

//create a category
router.post("/", authHandler, createCategory);
//get an array of categorys
router.get("/", authHandler, getCategorys);
//get data of a category
router.get("/:id", authHandler, getCategory);

export default router;
