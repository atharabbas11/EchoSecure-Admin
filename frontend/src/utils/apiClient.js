// src/utils/apiClient.js
import axios from 'axios';
// Create an instance of axios with the base URL from environment variables
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Use VITE_ prefix
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;