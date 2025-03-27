import express, { Router } from "express";
import authHandler from "../middlewares/authHandler";
import { createCategory } from "../controllers/categoryController";

const router: Router = express.Router();

//category routes

//create a category
router.post("/", authHandler, createCategory);

export default router;
