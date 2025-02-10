// utils/auth.js
import apiClient from "./apiClient";

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

export const checkAuthStatus = async () => {
  try {
    const response = await apiClient.get('/auth/check-auth', { withCredentials: true });
    return response.data.authenticated;
  } catch (error) {
    console.error("Auth Check Failed:", error.response?.data || error.message);
    return false;
  }
};
