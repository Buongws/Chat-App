import { apiClient } from "../api/apiConfig";
import Toast from "../utility/toast";

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

const logout = async () => {
  try {
    await apiClient.get("/logout");

    // Clear local storage data
    localStorage.removeItem("user");
    localStorage.removeItem("socketcluster.authToken");
  } catch (error) {
    Toast.showError("Logout failed");
    throw error;
  }
};

export default {
  register,
  login,
  logout,
};
