import axiosClient from "./axiosClient";

const orderApi = {
  placeOrder: (data) => axiosClient.post("/orders", data),
  myOrders: () => axiosClient.get("/orders"),
  getMyOrders: () => axiosClient.get("/orders"),
  getAllOrders: () => axiosClient.get("/orders/all"),
};

export default orderApi;
