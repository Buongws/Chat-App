import axios from "axios";

export const inviteApi = import.meta.env.VITE_INVITE_CODE_URL;

// export const inviteApi = axios.create({
//   baseURL: import.meta.env.VITE_INVITE_CODE_URL,
// });

// Base Axios instances for different API clients
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const apiClientServer = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_SERVER,
});

export const apiClientChannel = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_SERVER,
});

// Helper function to get access token from localStorage
export const getAccessToken = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  return userData?.data?.accessToken || null;
};

// Helper function to get refresh token from localStorage
const getRefreshToken = () => {
  const userData = JSON.parse(localStorage.getItem("user"));
  return userData?.data?.refreshToken || null;
};

// Helper function to save new access token to localStorage
const saveTokens = (newAccessToken, newRefreshToken) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  userData.data.accessToken = newAccessToken;
  userData.data.refreshToken = newRefreshToken;
  localStorage.setItem("user", JSON.stringify(userData));
};

// Interceptor to attach Authorization header with the access token
const attachTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

let refreshController = null; // Variable to hold the AbortController instance
let isRefreshing = false; // Flag to check if a refresh request is in progress
let refreshPromise = null; // Store the promise of the refresh request

const setupRefreshInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        // Check if another refresh request is already in progress
        if (isRefreshing) {
          // Wait for the ongoing refresh request to complete
          return refreshPromise.then((newAccessToken) => {
            // Update the original request with the new access token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          });
        }

        // Create a new AbortController for the current refresh request
        refreshController = new AbortController();
        const { signal } = refreshController;
        isRefreshing = true;

        // Create a new refresh request promise
        refreshPromise = new Promise((resolve, reject) => {
          const refreshTokenProcess = async () => {
            try {
              const refreshToken = getRefreshToken();
              if (!refreshToken) {
                throw new Error("Refresh token is missing.");
              }

              // Refresh the token
              const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/refresh-token`,
                { refreshToken },
                { signal } // Pass the signal to the Axios request
              );

              const newAccessToken = response?.data?.data?.accessToken;
              const newRefreshToken = response?.data?.data?.refreshToken;

              if (!newAccessToken || !newRefreshToken) {
                throw new Error("Failed to refresh token.");
              }

              // Save the new tokens
              saveTokens(newAccessToken, newRefreshToken);

              // Resolve the promise with the new access token
              resolve(newAccessToken);

              // Retry the original request with the new access token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axios(originalRequest);
            } catch (err) {
              console.error("Token refresh failed:", err);
              localStorage.removeItem("user");
              window.location.href = "/login";
              reject(err);
            } finally {
              // Clean up after the refresh process is complete
              isRefreshing = false;
              refreshController = null;
              refreshPromise = null;
            }
          };

          refreshTokenProcess();
        });

        // Return the refresh promise
        return refreshPromise;
      }

      return Promise.reject(error);
    }
  );
};

// Attach interceptors to apiClientServer and apiClientChannel
attachTokenInterceptor(apiClientServer);
setupRefreshInterceptor(apiClientServer);

attachTokenInterceptor(apiClientChannel);
setupRefreshInterceptor(apiClientChannel);

attachTokenInterceptor(apiClient);
setupRefreshInterceptor(apiClient);

// attachTokenInterceptor(inviteApi);
// setupRefreshInterceptor(inviteApi);
