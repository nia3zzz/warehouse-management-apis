import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import {
  createProduct,
  getProduct,
  getProducts,
} from "../controllers/productController";

const router: Router = express.Router();

//product routes

//create a product
router.post("/", authHandler, createProduct);
//get products
router.get("/", authHandler, getProducts);
//get product
router.get("/:id", authHandler, getProduct);

export default router;
