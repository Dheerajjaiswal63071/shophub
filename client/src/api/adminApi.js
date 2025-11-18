import axiosClient from "./axiosClient";

const adminApi = {
  dashboard: () => axiosClient.get("/admin/stats"),
  users: () => axiosClient.get("/admin/users"),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
  orders: () => axiosClient.get("/admin/orders"),
  updateOrder: (id, status) =>
    axiosClient.put(`/admin/orders/${id}`, { status }),
  deleteOrder: (id) => axiosClient.delete(`/admin/orders/${id}`),
  
  // Product management (uses /products routes with admin auth)
  createProduct: (data) => axiosClient.post("/products", data),
  updateProduct: (id, data) => axiosClient.put(`/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`),
};

export default adminApi;
