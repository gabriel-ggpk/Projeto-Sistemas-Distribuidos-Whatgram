import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:3000/", // Replace with your API's baseURL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Replace 'authToken' with your actual token key
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    const userId = localStorage.getItem("userId");
    if (userId) {
      config.headers["userId"] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // localStorage.clear(); // Clear localStorage
      // Redirecting needs to be handled in the context of a component or hook, see the note below.
    }
    return Promise.reject(error);
  }
);

export default api;
