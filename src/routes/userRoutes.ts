import express, { Router } from "express";
import { createAdmin, loginAdmin, getRequestsAdmin } from "../controllers/userControllers";
import upload from "../utils/multerSetup";
import authHandler from "../middlewares/authHandler";

const router: Router = express.Router();

//admin routes

//create admin route
router.post("/admin", upload.single("profile_Picture"), createAdmin);
//login admin route
router.post("/admin/login", loginAdmin);
//get requests admin route
router.get("/admin/requests",authHandler ,getRequestsAdmin)

export default router ;
