import { apiClient } from "../api/apiConfig";

const register = async (name, email, password) => {
  try {
    const response = await apiClient.post("/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const response = await apiClient.post("/login", {
      email,
      password,
    });

    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error; 
  }
};

const logout = () => {
  localStorage.removeItem("user");
};

export default {
  register,
  login,
  logout,
};
