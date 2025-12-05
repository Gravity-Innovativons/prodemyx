import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InstructorSidebar from "../components/InstructorSidebar";
import { BASE_URL } from "../api.js";

const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${url}`, {
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

const InstructorAssignedCourses = () => {
    const navigate = useNavigate();
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || user.role !== "instructor") {
            navigate("/login");
            return;
        }

        loadAssignedCourses();
    }, [navigate]);

    const loadAssignedCourses = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            // Fetch all courses and filter by instructor
            const data = await apiFetch("/api/courses");
            const instructorCourses = data.filter(course => course.instructor_id === user.id);
            setAssignedCourses(Array.isArray(instructorCourses) ? instructorCourses : []);
        } catch (err) {
            console.error("Failed to load courses:", err);
            setError(err.message || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen">
            <div className="relative flex min-h-screen w-full">
                <InstructorSidebar />

                <div className="flex-1">
                    <TopNavbar user={user} />

                    <main className="p-6">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-6">
                                My Assigned Courses
                            </h1>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                View and manage all courses assigned to you as an instructor.
                            </p>

                            {loading ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <p className="text-gray-500">Loading your courses...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <p className="text-red-500">Error: {error}</p>
                                </div>
                            ) : assignedCourses.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">
                                        school
                                    </span>
                                    <p className="text-gray-500 text-lg">No courses assigned yet.</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Contact the administrator to get courses assigned to you.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Course Title
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Category
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Description
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Duration
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Price
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Zoom Link
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Materials
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                                {assignedCourses.map((course) => (
                                                    <tr
                                                        key={course.id}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {course.id}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                            {course.title}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                            {course.category_name || "-"}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                                                            <div className="line-clamp-2">
                                                                {course.short_description || course.description || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                            {course.duration || "-"}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                            {course.price ? `₹${course.price}` : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full ${course.status === "published"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                    }`}
                                                            >
                                                                {course.status || "draft"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {course.zoom_link ? (
                                                                <a
                                                                    href={course.zoom_link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">
                                                                        video_call
                                                                    </span>
                                                                    Join Meeting
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-400">No link</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {course.file ? (
                                                                <a
                                                                    href={
                                                                        course.file.startsWith("http")
                                                                            ? course.file
                                                                            : `${BASE_URL}${course.file}`
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">
                                                                        download
                                                                    </span>
                                                                    Download
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-400">No files</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
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
                    {user?.name || "Instructor"}
                </span>
            </div>
        </div>
    </header>
);

export default InstructorAssignedCourses;
