import express from "express";
import {
  getDashboardStats,
  getUsers,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from "../controllers/adminController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, admin, getDashboardStats);
router.get("/users", protect, admin, getUsers);
router.delete("/users/:id", protect, admin, deleteUser);

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id", protect, admin, updateOrderStatus);
router.delete("/orders/:id", protect, admin, deleteOrder);

export default router;
