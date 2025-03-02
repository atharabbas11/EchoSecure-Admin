import React, { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    fullName: "",
    password: "",
    profilePic: "",
    deleteOption: "off",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, userId: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/users", { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to fetch users", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleCreateUser = async () => {
    try {
      const response = await apiClient.post("/users", { ...newUser, password: undefined }, { withCredentials: true });
      setUsers([...users, response.data]);
      setSnackbar({ open: true, message: "User created successfully", severity: "success" });
      setOpenDialog(false);
      setNewUser({ email: "", fullName: "", password: "", profilePic: "", deleteOption: "off" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to create user", severity: "error" });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await apiClient.delete(`/users/${id}`, { withCredentials: true });
      setUsers(users.filter((user) => user._id !== id));
      setSnackbar({ open: true, message: "User deleted successfully", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to delete user", severity: "error" });
    } finally {
      setDeleteConfirmation({ open: false, userId: null });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Users List</h1>

      <button
        onClick={() => setOpenDialog(true)}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Add User
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-sm font-semibold">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Profile Picture</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{user.fullName}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-12 h-12 rounded-full" />
                    ) : (
                      <FaUser className="w-12 h-12 text-gray-500 rounded-full" />
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => setDeleteConfirmation({ open: true, userId: user._id })}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirmation.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setDeleteConfirmation({ open: false, userId: null })}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmation.userId)}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Add New User</h3>
            <input
              type="text"
              placeholder="Email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <input
              type="text"
              placeholder="Full Name"
              name="fullName"
              value={newUser.fullName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              readOnly
            />
            <input
              type="text"
              placeholder="Profile Picture URL"
              name="profilePic"
              value={newUser.profilePic}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              readOnly
            />
            <select
              name="deleteOption"
              value={newUser.deleteOption}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="off">Off</option>
              <option value="1 day">1 Day</option>
              <option value="7 days">7 Days</option>
              <option value="1 month">1 Month</option>
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setOpenDialog(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {snackbar.open && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md ${
            snackbar.severity === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default UsersList;
