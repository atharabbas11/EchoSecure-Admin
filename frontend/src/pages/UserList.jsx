import React, { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import { FaUser } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import AnimatedLogo from './AniLogo';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, userId: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialog, setEditDialog] = useState({ open: false, user: null, newEmail: "" }); // State for edit dialog

  useEffect(() => {
    fetchUsers();
  }, []);

   // Auto-close snackbar after 5 seconds
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar({ ...snackbar, open: false });
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);


  const fetchUsers = async () => {
    try {
      const response = await apiClient.get("/users", { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to fetch users", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AnimatedLogo />;

  if (error) return <div className="text-red-500">{error}</div>;

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

  const handleEditEmail = (user) => {
    setEditDialog({ open: true, user, newEmail: user.email });
  };

  const handleSaveEmail = async () => {
    try {
      const { user, newEmail } = editDialog;
      const response = await apiClient.put(`/users/${user._id}/email`, { email: newEmail }, { withCredentials: true });
      setUsers(users.map((u) => (u._id === user._id ? response.data : u)));
      setSnackbar({ open: true, message: "Email updated successfully", severity: "success" });
      setEditDialog({ open: false, user: null, newEmail: "" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to update email", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-semibold mb-6">Users List</h1>

      <button onClick={() => setOpenDialog(true)} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all">
        Add User
      </button>

      {/* Search bar */}
      <div className="my-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div></div>
        // <AnimatedLogo />
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Profile Picture</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">{user.fullName}</td>
                    <td className="mx-auto px-6 py-7 flex justify-between items-center w-full">
                      {user.email}
                      <button
                        onClick={() => handleEditEmail(user)}
                        className="text-blue-500 hover:text-blue-700 transition-all text-xl"
                      >
                        <CiEdit />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt="Profile" className="w-12 h-12 rounded-full" />
                      ) : (
                        <FaUser className="w-12 h-12 text-gray-500 rounded-full" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteConfirmation({ open: true, userId: user._id })}
                        className="text-red-500 hover:text-red-700 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setDeleteConfirmation({ open: false, userId: null })}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmation.userId)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Dialog */}
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
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            />
            <input
              type="text"
              placeholder="Full Name"
              name="fullName"
              value={newUser.fullName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              readOnly
            />
            <input
              type="text"
              placeholder="Profile Picture URL"
              name="profilePic"
              value={newUser.profilePic}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              readOnly
            />
            <select
              name="deleteOption"
              value={newUser.deleteOption}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            >
              <option value="off">Off</option>
              <option value="1 day">1 Day</option>
              <option value="7 days">7 Days</option>
              <option value="1 month">1 Month</option>
            </select>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => {
                  setOpenDialog(false); 
                  setNewUser({ email: "", fullName: "", password: "", profilePic: "", deleteOption: "off" });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Email Dialog */}
      {editDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Edit Email</h3>
            <input
              type="email"
              placeholder="New Email"
              value={editDialog.newEmail}
              onChange={(e) => setEditDialog({ ...editDialog, newEmail: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setEditDialog({ open: false, user: null, newEmail: "" })}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmail}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md text-white ${snackbar.severity === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default UsersList;
