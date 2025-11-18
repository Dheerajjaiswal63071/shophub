import axiosClient from "./axiosClient";

const aiApi = {
  chat: async ({ message, history = [] }) => {
    const res = await axiosClient.post("/ai/chat", { message, history });
    return res.data;
  },
};

export default aiApi;
