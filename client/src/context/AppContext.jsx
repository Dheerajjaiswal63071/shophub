import React, { createContext, useContext, useEffect, useState } from "react";
import authApi from "../api/authApi";
import productApi from "../api/productApi";
import orderApi from "../api/orderApi";
import adminApi from "../api/adminApi";

export const AppContext = createContext({
  user: null,
  setUser: () => {},
  login: () => {},
  register: () => {},
  logout: () => {},
  products: [],
  loadProducts: () => {},
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartQty: () => {},
  clearCart: () => {},
  orders: [],
  loadMyOrders: () => {},
  placeOrder: () => {},
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
  getAdminStats: () => {},
  getUsers: () => {},
  deleteUser: () => {},
  adminOrders: () => {},
  updateOrderStatus: () => {},
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // Load token user on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authApi
        .profile()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        });
    }

    loadProducts();
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  // -----------------------------------------
  // AUTH FUNCTIONS
  // -----------------------------------------
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    // Don't auto-login after registration
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // -----------------------------------------
  // PRODUCTS FUNCTIONS
  // -----------------------------------------
  const loadProducts = async () => {
    try {
      const res = await productApi.getAll();
      setProducts(res.data);
      localStorage.setItem("products", JSON.stringify(res.data));
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    }
  };

  // Admin
  const addProduct = async (p) => {
    const res = await adminApi.createProduct(p);
    const newProduct = res.data.product;
    const updated = [...products, newProduct];
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    return newProduct;
  };

  const updateProduct = async (id, p) => {
    const res = await adminApi.updateProduct(id, p);
    const updatedProduct = res.data;
    const updated = products.map((prod) => 
      prod._id === id ? updatedProduct : prod
    );
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    return updatedProduct;
  };

  const deleteProduct = async (id) => {
    try {
      await adminApi.deleteProduct(id);
      const updated = products.filter((p) => p._id !== id);
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Failed to delete product: " + (error.response?.data?.message || error.message));
    }
  };

  // -----------------------------------------
  // CART FUNCTIONS
  // -----------------------------------------
  const addToCart = (product, qty = 1) => {
    const exists = cart.find((i) => i._id === product._id);

    let newCart;

    if (exists) {
      newCart = cart.map((i) =>
        i._id === product._id ? { ...i, quantity: i.quantity + qty } : i
      );
    } else {
      newCart = [...cart, { ...product, quantity: qty }];
    }

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter((item) => item._id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const updateCartQty = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const newCart = cart.map((i) =>
      i._id === id ? { ...i, quantity: qty } : i
    );
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", "[]");
  };

  // -----------------------------------------
  // ORDER FUNCTIONS
  // -----------------------------------------
  const placeOrder = async (checkoutData) => {
    const orderItems = cart.map((i) => ({
      product: i._id,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
    }));

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const res = await orderApi.placeOrder({
      items: orderItems,
      total,
      shippingInfo: checkoutData,
    });

    clearCart();
    return res.data.order;
  };

  const loadMyOrders = async () => {
    const res = await orderApi.myOrders();
    setOrders(res.data);
  };

  // -----------------------------------------
  // ADMIN FUNCTIONS
  // -----------------------------------------
  const getAdminStats = () => adminApi.dashboard();
  const getUsers = () => adminApi.users();
  const deleteUser = (id) => adminApi.deleteUser(id);
  const adminOrders = () => adminApi.orders();
  const updateOrderStatus = (id, status) =>
    adminApi.updateOrder(id, status);

  // -----------------------------------------
  // CONTEXT VALUE
  // -----------------------------------------
  const value = {
    user,
    setUser,
    login,
    register,
    logout,

    products,
    loadProducts,

    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,

    orders,
    loadMyOrders,
    placeOrder,

    addProduct,
    updateProduct,
    deleteProduct,

    getAdminStats,
    getUsers,
    deleteUser,
    adminOrders,
    updateOrderStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
