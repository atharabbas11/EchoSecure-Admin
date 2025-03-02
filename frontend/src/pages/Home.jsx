import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import { FaUsers, FaComment } from 'react-icons/fa';
import Avatar from "react-avatar";
import { fetchCsrfToken } from '../utils/auth'; // Import fetchCsrfToken

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch CSRF token before making the request
        await fetchCsrfToken();

        // Get the CSRF token from Axios headers
        const csrfToken = apiClient.defaults.headers.common['X-CSRF-Token']; // Get CSRF token
        console.log('CSRF Token in Headers:', csrfToken); // Debugging log
    
        const response = await apiClient.get('/admin/stats', {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken }, // Include CSRF token
        });
        console.log("Admin Stats Response:", response.data);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center mt-4"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

  if (error) return <div className="text-red-500">{error}</div>;

  if (!stats) return <h2 className="text-lg font-semibold">No data available</h2>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex bg-white p-6 rounded-lg shadow-md items-center space-x-4">
          <FaUsers className="text-blue-500 text-5xl" />
          <div>
            <h2 className="text-lg font-medium">Total Users</h2>
            <p className="text-3xl font-bold">{stats.totalUsers ?? 0}</p>
          </div>
        </div>

        <div className="flex bg-white p-6 rounded-lg shadow-md items-center space-x-4">
          <FaComment className="text-green-500 text-5xl" />
          <div>
            <h2 className="text-lg font-medium">Total Messages</h2>
            <p className="text-3xl font-bold">{stats.totalMessages ?? 0}</p>
          </div>
        </div>
      </div>

      {stats.latestUsers && stats.latestUsers.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Latest Users</h2>
          <div className="flex flex-wrap gap-4 justify-between">
            {stats.latestUsers.map((user) => (
              <div key={user._id} className="flex items-center bg-white p-4 rounded-lg shadow-md w-80">
                <Avatar src={user.profilePic} alt={user.fullName} className="w-12 h-12 mr-4 rounded"/>
                {console.log(user.profilePic)}
                <div>
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-lg font-medium text-gray-600 mt-4">No recent users</p>
      )}
    </div>
  );
};

export default Home;
