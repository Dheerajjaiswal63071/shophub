import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc Admin: Get analytics
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "customer" });
    const revenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: revenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin: Get all users
export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// @desc Admin: Delete user
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

// @desc Admin: Get all orders
export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
};

// @desc Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json(order);
};

// @desc Admin: Delete order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully", orderId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
