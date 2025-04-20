import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import { createSale } from "../controllers/saleController";

const router: Router = express.Router();

//sale routes

//create a sale
router.post("/", authHandler, createSale);

export default router;
