import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { BASE_URL } from "../api.js";

export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "student",
  });

  // Token-aware API helper
  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }

    if (!res.ok) {
      throw new Error((data && data.message) || "API error");
    }
    return data;
  };

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/users", { method: "GET" });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.name || ""}?`)) return;

    try {
      setBusyId(user.id);
      await apiFetch(`/api/users/${user.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete user");
    } finally {
      setBusyId(null);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "student",
    });
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "student",
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    try {
      setBusyId(selectedUser.id);
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await apiFetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      await loadUsers();
      setShowModal(false);
      alert("User updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update user");
    } finally {
      setBusyId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalMode('view');
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
  };

  // Filter + search logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const term = (searchTerm || "").toLowerCase();

      if (term && !fullName.includes(term) && !email.includes(term)) {
        return false;
      }

      if (roleFilter !== "All" && (u.role || "").toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [users, searchTerm, roleFilter]);

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (u) => {
    const name = u.name || "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-lg font-semibold">
        Loading users...
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                View, search, and manage all users in the system.
              </p>
            </div>

            <button
              onClick={() => navigate("/createuser")}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary/90"
            >
              <span className="material-symbols-outlined">add</span>
              Add New User
            </button>
          </div>

          {/* Search + filters */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Search box */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700">
                  <span className="material-symbols-outlined text-gray-400">search</span>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email..."
                    className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 justify-end">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Role:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                  >
                    <option>All</option>
                    <option>student</option>
                    <option>instructor</option>
                    <option>admin</option>
                  </select>
                </div>

                <button
                  onClick={resetFilters}
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Phone</th>
                    <th className="px-6 py-4 text-left">Role</th>
                    <th className="px-6 py-4 text-left">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-sm text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}

                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {u.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-300">
                            {getInitials(u)}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {u.name || "-"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {u.email || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {u.phone || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : u.role === 'instructor'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                          {u.role || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(u.created_at)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(u)}
                            className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditUser(u)}
                            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            Edit
                          </button>

                          <button
                            disabled={busyId === u.id}
                            onClick={() => handleDelete(u)}
                            className="px-2 py-1 rounded text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 disabled:opacity-60 hover:bg-red-100 dark:hover:bg-red-800"
                          >
                            {busyId === u.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* User Details/Edit Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {modalMode === 'edit' ? 'Edit User' : 'User Details'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User ID
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.id}</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  {modalMode === 'edit' ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{selectedUser.name || "-"}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  {modalMode === 'edit' ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{selectedUser.email || "-"}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  {modalMode === 'edit' ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{selectedUser.phone || "-"}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  {modalMode === 'edit' ? (
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded-full ${selectedUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : selectedUser.role === 'instructor'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                      {selectedUser.role || "-"}
                    </span>
                  )}
                </div>

                {/* Created At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Created At
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  {modalMode === 'edit' ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{selectedUser.address || "-"}</p>
                  )}
                </div>

                {/* Password (only when editing) */}
                {modalMode === 'edit' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password (leave blank to keep current)
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {modalMode === 'edit' ? 'Cancel' : 'Close'}
              </button>
              {modalMode === 'view' ? (
                <>
                  <button
                    onClick={() => setModalMode('edit')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={() => handleDelete(selectedUser)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    disabled={busyId === selectedUser.id}
                  >
                    {busyId === selectedUser.id ? "Deleting..." : "Delete User"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
                  disabled={busyId === selectedUser.id}
                >
                  {busyId === selectedUser.id ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
