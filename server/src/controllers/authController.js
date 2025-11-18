import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ name, email, password, phone, address });

    res.json({
      success: true,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        address: user.address,
        houseNo: user.houseNo,
        street: user.street,
        landmark: user.landmark,
        nearBy: user.nearBy,
        city: user.city,
        district: user.district,
        state: user.state,
        pincode: user.pincode,
        role: user.role 
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      success: true,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        address: user.address,
        houseNo: user.houseNo,
        street: user.street,
        landmark: user.landmark,
        nearBy: user.nearBy,
        city: user.city,
        district: user.district,
        state: user.state,
        pincode: user.pincode,
        role: user.role 
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user; // from middleware
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, houseNo, street, landmark, nearBy, city, district, state, pincode } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.houseNo = houseNo || user.houseNo;
    user.street = street || user.street;
    user.landmark = landmark || user.landmark;
    user.nearBy = nearBy || user.nearBy;
    user.city = city || user.city;
    user.district = district || user.district;
    user.state = state || user.state;
    user.pincode = pincode || user.pincode;

    await user.save();

    res.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        houseNo: user.houseNo,
        street: user.street,
        landmark: user.landmark,
        nearBy: user.nearBy,
        city: user.city,
        district: user.district,
        state: user.state,
        pincode: user.pincode,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
