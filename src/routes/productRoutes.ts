import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import { createProduct } from "../controllers/productController";

const router: Router = express.Router();

//product routes

//create a product
router.post("/", authHandler, createProduct);

export default router;
