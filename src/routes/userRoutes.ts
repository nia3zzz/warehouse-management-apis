import express, { Router } from "express";
import {
  createAdmin,
  loginAdmin,
  getRequestsAdmin,
  approveRemoveAdmin,
  verifyAdminEmail,
  logoutAdmin,
  requestChangePassword,
  changePassword,
  addSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} from "../controllers/userControllers";
import upload from "../utils/multerSetup";
import authHandler from "../middlewares/authHandler";

const router: Router = express.Router();

//admin routes

//create admin route
router.post("/admin", upload.single("profile_Picture"), createAdmin);
//login admin route
router.post("/admin/login", loginAdmin);
//get requests admin route
router.get("/admin/requests", authHandler, getRequestsAdmin);
//approve or remove an admin route
router.put("/admin/requests/:id", authHandler, approveRemoveAdmin);
//verify email of admin
router.post("/admin/verifyemail/:id", verifyAdminEmail);
//logout admin
router.post("/admin/logout", authHandler, logoutAdmin);
//request password change of admin
router.put("/admin/requestchangepassword", authHandler, requestChangePassword);
//change password of admin with code
router.put("/admin/changepassword", authHandler, changePassword);

//supplier routes

//add an supplier
router.post("/supplier", authHandler, addSupplier);
//get an array of suppliers
router.get("/supplier", authHandler, getSuppliers);
//update a supplier
router.put("/supplier/:supplierId", authHandler, updateSupplier);
//delee a supplier
router.delete("/supplier/:supplierId", authHandler, deleteSupplier);

export default router;
