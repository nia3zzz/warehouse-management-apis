import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController";

const router: Router = express.Router();

//product routes

//create a product
router.post("/", authHandler, createProduct);
//get products
router.get("/", authHandler, getProducts);
//get product
router.get("/:id", authHandler, getProduct);
//update product
router.put("/:id", authHandler, updateProduct);
//delete product
router.delete("/:id", authHandler, deleteProduct);

export default router;
