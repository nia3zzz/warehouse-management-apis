import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import {
  createSale,
  deleteSale,
  getSale,
  getSales,
  updateSale,
  updateSaleOrderStatus,
} from "../controllers/saleController";

const router: Router = express.Router();

//sale routes

//create a sale
router.post("/", authHandler, createSale);
//get sales data
router.get("/", authHandler, getSales);
//get sale data
router.get("/:id", authHandler, getSale);
//update sale data
router.put("/:id", authHandler, updateSale);
//delete a sale
router.delete("/:id", authHandler, deleteSale);
//update status of an order
router.put("/status/:id", authHandler, updateSaleOrderStatus);

export default router;
