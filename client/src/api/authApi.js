import axiosClient from "./axiosClient";

const authApi = {
  register: (data) => axiosClient.post("/auth/register", data),
  login: (data) => axiosClient.post("/auth/login", data),
  profile: () => axiosClient.get("/auth/profile"),
  updateProfile: (data) => axiosClient.put("/auth/profile", data),
  getAllUsers: () => axiosClient.get("/auth/users"),
};

export default authApi;
