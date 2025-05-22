import axios from "axios";

const token = localStorage.getItem("accessToken");

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  withCredentials: false,
});

export default axiosInstance;
