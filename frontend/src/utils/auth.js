// utils/auth.js
import apiClient from "./apiClient";

// Fetch and set CSRF token
export const fetchCsrfToken = async () => {
  try {
    const response = await apiClient.get('/auth/csrf-token', { withCredentials: true });
    const csrfToken = response.data.csrfToken;
    apiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken; // Set CSRF token globally
    console.log('Fetched CSRF Token:', csrfToken); // Debugging log
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
};

// Check authentication status
export const checkAuthStatus = async () => {
  try {
    const response = await apiClient.get('/auth/check-auth', { withCredentials: true });
    return response.data.authenticated;
  } catch (error) {
    console.error("Auth Check Failed:", error.response?.data || error.message);

    // If access token expired, try refreshing it
    if (error.response?.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return checkAuthStatus(); // Retry auth check after refreshing
      }
    }

    return false;
  }
};

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    console.log("Attempting to refresh access token...");
    const response = await apiClient.post('/auth/refresh-token', {}, { withCredentials: true });
    console.log("Access token refreshed successfully");
    return true;
  } catch (error) {
    console.error("Failed to refresh access token:", error.response?.data || error.message);
    return false;
  }
};
