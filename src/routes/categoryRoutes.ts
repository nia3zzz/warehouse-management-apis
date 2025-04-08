import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import {
  createCategory,
  getCategorys,
} from "../controllers/categoryController";

const router: Router = express.Router();

//category routes

//create a category
router.post("/", authHandler, createCategory);
//get an array of categorys
router.get("/", authHandler, getCategorys);

export default router;
