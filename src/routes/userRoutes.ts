import express, { Router } from "express";
import { createAdmin, loginAdmin, getRequestsAdmin, approveRemoveAdmin, verifyAdminEmail } from "../controllers/userControllers";
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
//approve or remove an admin route
router.put("/admin/requests/:id",authHandler, approveRemoveAdmin)
//verify email of admin
router.post("/admin/verifyemail/:id",authHandler, verifyAdminEmail)

export default router ;
