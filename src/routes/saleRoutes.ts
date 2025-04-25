import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import { createSale, getSales } from "../controllers/saleController";

const router: Router = express.Router();

//sale routes

//create a sale
router.post("/", authHandler, createSale);
//get sales data
router.get("/", authHandler, getSales);

export default router;
