import Order from "../models/Order.js";

// @desc Place order
export const placeOrder = async (req, res) => {
  try {
    const { items, total, shippingInfo } = req.body;

    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      shippingInfo
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
