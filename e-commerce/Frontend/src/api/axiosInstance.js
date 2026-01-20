import axios from "axios";
const api = axios.create({
  // baseURL: "http://192.168.1.191:3005/v1/api",
  baseURL : "http://localhost:3005/v1/api",
  withCredentials: true,
});


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Token expired or invalid");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
  