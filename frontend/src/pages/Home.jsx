import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import { FaUser, FaUsers, FaComment } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js';
import { fetchCsrfToken } from '../utils/auth';
import CountUp from 'react-countup';
import OpenLayersMapComponent from './OpenLayersMapComponent';
import AnimatedLogo from './AniLogo';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUsersTimeRange, setNewUsersTimeRange] = useState('3m'); // Time range for new users
  const [loggedInUsersTimeRange, setLoggedInUsersTimeRange] = useState('3m'); // Time range for logged-in users
  const [onemessagesTimeRange, onesetMessagesTimeRange] = useState('3m'); // Time range for one-to-one messages
  const [manymessagesTimeRange, manysetMessagesTimeRange] = useState('3m'); // Time range for one-to-many messages
  const [hoveredMarker, setHoveredMarker] = useState(null); // Track hovered marker

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await fetchCsrfToken();
        const csrfToken = apiClient.defaults.headers.common['X-CSRF-Token'];
        const response = await apiClient.get('/admin/stats', {
          params: { 
            newUsersTimeRange, // Pass new users time range
            loggedInUsersTimeRange, // Pass logged-in users time range
            onemessagesTimeRange, // Pass one-to-one messages time range
            manymessagesTimeRange, // Pass one-to-many messages time range
          },
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [newUsersTimeRange, loggedInUsersTimeRange, onemessagesTimeRange, manymessagesTimeRange]); // Re-fetch data when any time range changes

  if (loading) return <AnimatedLogo />;

  if (error) return <div className="text-red-500">{error}</div>;

  if (!stats) return <h2 className="text-lg font-semibold">No data available</h2>;

  const filteredUsers = stats.latestUsers.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for the new users graph
  const newUsersData = {
    labels: stats.userGrowth.map(entry => entry._id), // Dates for the x-axis
    datasets: [
      {
        label: 'New Users',
        data: stats.userGrowth.map(entry => entry.count),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare data for the logged-in users graph
  const loggedInUsersData = {
    labels: stats.loginActivity.map(entry => entry._id), // Dates for the x-axis
    datasets: [
      {
        label: 'Logged In Users',
        data: stats.loginActivity.map(entry => entry.count),
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare data for the one-to-one messages graph
  const oneToOneMessagesData = {
    labels: stats.oneToOneMessages.map(entry => entry._id), // Dates for the x-axis
    datasets: [
      {
        label: 'Chat Messages',
        data: stats.oneToOneMessages.map(entry => entry.count),
        borderColor: 'rgba(54,162,235,1)',
        backgroundColor: 'rgba(54,162,235,0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare data for the one-to-many messages graph
  const oneToManyMessagesData = {
    labels: stats.oneToManyMessages.map(entry => entry._id), // Dates for the x-axis
    datasets: [
      {
        label: 'Group Messages',
        data: stats.oneToManyMessages.map(entry => entry.count),
        borderColor: 'rgba(255,159,64,1)',
        backgroundColor: 'rgba(255,159,64,0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const locations = stats.sessionData
  .filter(session => session.coordinates) // Ensure coordinates exist
  .map(session => ({
    lat: session.coordinates[0],
    lng: session.coordinates[1],
    label: session.type === 'user'
      ? session.userDetails?.fullName || 'Unknown User' // Handle missing userDetails
      : session.adminDetails?.fullName || 'Unknown Admin', // Handle missing adminDetails
    ipAddress: session.ipAddress,
    isp: session.isp,
    org: session.org,
    timezone: session.timezone,
    type: session.type,
  }));
  // console.log('Locations:', locations);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-center">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="flex bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-md items-center space-x-4">
          <FaUsers className="text-white text-5xl" />
          <div>
            <h2 className="text-lg font-medium">Total Users</h2>
            <p className="text-3xl font-bold">
              <CountUp
                end={stats.totalUsers ?? 0}
                duration={2.5} // Animation duration in seconds
                separator="," // Add commas for thousands
              />
            </p>
          </div>
        </div>

        {/* Total Messages Card */}
        <div className="flex bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg shadow-md items-center space-x-4">
          <FaComment className="text-white text-5xl" />
          <div>
            <h2 className="text-lg font-medium">Total Messages</h2>
            <p className="text-3xl font-bold">
              <CountUp
                end={stats.totalMessages ?? 0}
                duration={2.5}
                separator=","
              />
            </p>
          </div>
        </div>

        {/* New Users Today Card */}
        <div className="flex bg-gradient-to-r from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow-md items-center space-x-4">
          <FaUser className="text-white text-5xl" />
          <div>
            <h2 className="text-lg font-medium">New Users Today</h2>
            <p className="text-3xl font-bold">
              <CountUp
                end={stats.newUsersToday ?? 0}
                duration={2.5}
                separator=","
              />
            </p>
          </div>
        </div>

        {/* Active Users Today Card */}
        <div className="flex bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-lg shadow-md items-center space-x-4">
          <FaUser className="text-white text-5xl" />
          <div>
            <h2 className="text-lg font-medium">Active Users Today</h2>
            <p className="text-3xl font-bold">
              <CountUp
                end={stats.activeUsersToday ?? 0}
                duration={2.5}
                separator=","
              />
            </p>
          </div>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row mx-auto'>
        {/* New Users Graph */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full lg:w-1/2 lg:mr-4">
          <div className='flex items-center justify-between mb-4'>
            <h2 className="text-2xl font-semibold">New Users</h2>
            <select 
              id="newUsersTimeRange" 
              value={newUsersTimeRange} 
              onChange={(e) => setNewUsersTimeRange(e.target.value)} 
              className="p-2 border rounded-md"
            >
              <option value="7d">Last 7 Days</option>
              <option value="1m">Last 1 Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>
          <Line 
            data={newUsersData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  titleColor: 'white',
                  bodyColor: 'white',
                  bodyFont: { size: 14 },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#555',
                    font: { size: 12 },
                  },
                },
                y: {
                  ticks: {
                    color: '#555',
                    font: { size: 12 },
                  },
                },
              },
            }} 
          />
        </div>

        {/* Logged-In Users Graph */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full lg:w-1/2">
          <div className='flex items-center justify-between mb-4'>
            <h2 className="text-2xl font-semibold">Logged-In Users</h2>
            <select 
              id="loggedInUsersTimeRange" 
              value={loggedInUsersTimeRange} 
              onChange={(e) => setLoggedInUsersTimeRange(e.target.value)} 
              className="p-2 border rounded-md"
            >
              <option value="7d">Last 7 Days</option>
              <option value="1m">Last 1 Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>
          <Line 
            data={loggedInUsersData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  titleColor: 'white',
                  bodyColor: 'white',
                  bodyFont: { size: 14 },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#555',
                    font: { size: 12 },
                  },
                },
                y: {
                  ticks: {
                    color: '#555',
                    font: { size: 12 },
                  },
                },
              },
            }} 
          />
        </div>
      </div>

      <div className='flex flex-col lg:flex-row mx-auto'>
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full lg:w-1/2 lg:mr-4">
          <div className='flex items-center justify-between mb-4'>
            <h2 className="text-2xl font-semibold">Chat Messages</h2>
            <select id="onemessagesTimeRange" value={onemessagesTimeRange} onChange={(e) => onesetMessagesTimeRange(e.target.value)} className="p-2 border rounded-md">
              <option value="7d">Last 7 Days</option>
              <option value="1m">Last 1 Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>
          <Bar 
            data={oneToOneMessagesData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  titleColor: 'white',
                  bodyColor: 'white',
                  bodyFont: { size: 14 },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#555',
                    font: { size: 12 },
                  },
                },
                y: {
                  ticks: {
                    color: '#555',
                    font: { size: 12 },
                  },
                },
              },
            }} 
          />
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full lg:w-1/2">
          <div className='flex items-center justify-between mb-4'>
            <h2 className="text-2xl font-semibold">Group Messages</h2>
            <select id="manymessagesTimeRange" value={manymessagesTimeRange} onChange={(e) => manysetMessagesTimeRange(e.target.value)} className="p-2 border rounded-md">
              <option value="7d">Last 7 Days</option>
              <option value="1m">Last 1 Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
            </select>
          </div>
          <Bar 
            data={oneToManyMessagesData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  titleColor: 'white',
                  bodyColor: 'white',
                  bodyFont: { size: 14 },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#555',
                    font: { size: 12 },
                  },
                },
                y: {
                  ticks: {
                    color: '#555',
                    font: { size: 12 },
                  },
                },
              },
            }} 
          />
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">User and Admin Locations</h2>
        <OpenLayersMapComponent
          locations={locations}
          className="w-full h-96" // Adjust the height as needed
        />
      </div>

      {/* Latest Logins Table */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Latest Logins</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Profile Picture</th>
                <th className="py-2 px-4 border-b">Username</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Login Time</th>
                <th className="py-2 px-4 border-b">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {stats.sessionData && stats.sessionData.length > 0 ? (
                stats.sessionData.map((session, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">
                      {session.type === 'user' ? (
                        session.userDetails.profilePic ? (
                          <img src={session.userDetails.profilePic} alt={session.userDetails.fullName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <FaUser className="w-10 h-10 text-gray-500" />
                        )
                      ) : (
                        session.adminDetails.profilePic ? (
                          <img src={session.adminDetails.profilePic} alt={session.adminDetails.fullName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <FaUser className="w-10 h-10 text-gray-500" />
                        )
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {session.type === 'user' ? session.userDetails.fullName : session.adminDetails.fullName}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {session.type === 'user' ? 'User' : 'Admin'}
                    </td>
                    <td className="py-2 px-4 border-b">{new Date(session.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">{session.ipAddress}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-2 px-4 border-b text-center">No session data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Search and Display */}
      {stats.latestUsers && stats.latestUsers.length > 0 ? (
        <div className="mt-8">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <h2 className="text-2xl font-semibold mb-4">Latest Users</h2>
          <div className="flex flex-wrap gap-4 justify-between">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user._id} className="flex items-center bg-white p-4 rounded-lg shadow-md w-80">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullName} className="w-12 h-12 mr-4 rounded" />
                  ) : (
                    <FaUser className="w-12 h-12 mr-4 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-lg font-medium text-gray-600">No users found</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-lg font-medium text-gray-600 mt-4">No recent users</p>
      )}
    </div>
  );
};

export default Home;
