import express, { Router } from "express";
import { createAdmin } from "../controllers/userControllers";
import upload from "../utils/multerSetup";

const router: Router = express.Router();

//admin routes
router.post("/admin", upload.single("profile_Picture"), createAdmin);

export default router ;
