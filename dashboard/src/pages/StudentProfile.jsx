import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";

const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000${url}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API Error");
    return data;
};

const StudentProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || userData.role !== "student") {
            navigate("/login");
            return;
        }

        loadUserProfile();
    }, [navigate]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const data = await apiFetch("/api/me");
            setUser(data);
            setFormData({
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                password: "",
            });
        } catch (err) {
            console.error("Failed to load profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                role: user.role,
            };

            // Only include password if it's been changed
            if (formData.password) {
                updateData.password = formData.password;
            }

            await apiFetch(`/api/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify(updateData),
            });

            // Update local storage
            const updatedUser = { ...user, ...updateData };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setUser(updatedUser);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Failed to update profile:", err);
            alert("Failed to update profile: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            password: "",
        });
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark font-display min-h-screen">
                <div className="relative flex min-h-screen w-full">
                    <StudentSidebar />
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen">
            <div className="relative flex min-h-screen w-full">
                <StudentSidebar />

                <div className="flex-1">
                    <TopNavbar user={user} />

                    <main className="p-6">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-6">
                                My Profile
                            </h1>

                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                {/* Profile Header */}
                                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="size-20 rounded-full bg-cover bg-center"
                                            style={{
                                                backgroundImage:
                                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCPp9CSCQemHquzD1XC0S3-n6DQ-Ul8SJwLt3RGkcHUTNIxEJD0fiZazL-cW5yOe6Gr6fE_4Ya8bGDv6uSk_6I6svjn6xQ0RaGmrIiJxOkF8_xJONIC5Y7PAZT18FdX7LTvQyF-aoXmA2JCOiL1BK1PdvQNOMCQVmE1epROI_kYPgzcLopSW2pxrAsp9e3tGD1H59-y8CncVnBZTxasd_0MYLfNc_tjJ7mwPgHgxvXYHHAUeTxjRDV_JZwNSh9pXRAc68mRvgPr34g")',
                                            }}
                                        ></div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {user?.name}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {user?.email}
                                            </p>
                                            <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                Student
                                            </span>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {/* Profile Form */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">{user?.name || "-"}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">{user?.email || "-"}</p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">{user?.phone || "-"}</p>
                                            )}
                                        </div>

                                        {/* User ID
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                User ID
                                            </label>
                                            <p className="text-gray-900 dark:text-white">{user?.id}</p>
                                        </div> */}

                                        {/* Address */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Address
                                            </label>
                                            {isEditing ? (
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">{user?.address || "-"}</p>
                                            )}
                                        </div>

                                        {/* Password (only when editing) */}
                                        {isEditing && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

                                    {/* Action Buttons */}
                                    {isEditing && (
                                        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

const TopNavbar = ({ user }) => (
    <header className="flex justify-between items-center border-b bg-white dark:bg-gray-900 px-6 py-3">
        <input
            className="bg-background-light dark:bg-gray-800 px-4 h-10 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            placeholder="Search courses..."
        />
        <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-xl text-gray-600 dark:text-gray-400">
                notifications
            </span>
            <div className="flex items-center gap-2">
                <div
                    className="size-10 rounded-full bg-cover bg-center"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCPp9CSCQemHquzD1XC0S3-n6DQ-Ul8SJwLt3RGkcHUTNIxEJD0fiZazL-cW5yOe6Gr6fE_4Ya8bGDv6uSk_6I6svjn6xQ0RaGmrIiJxOkF8_xJONIC5Y7PAZT18FdX7LTvQyF-aoXmA2JCOiL1BK1PdvQNOMCQVmE1epROI_kYPgzcLopSW2pxrAsp9e3tGD1H59-y8CncVnBZTxasd_0MYLfNc_tjJ7mwPgHgxvXYHHAUeTxjRDV_JZwNSh9pXRAc68mRvgPr34g")',
                    }}
                ></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || "Student"}
                </span>
            </div>
        </div>
    </header>
);

export default StudentProfile;
