import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import { createProduct, getProducts } from "../controllers/productController";

const router: Router = express.Router();

//product routes

//create a product
router.post("/", authHandler, createProduct);
//get products
router.get("/", authHandler, getProducts);

export default router;
