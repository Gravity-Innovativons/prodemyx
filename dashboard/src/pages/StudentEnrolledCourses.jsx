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

const StudentEnrolledCourses = () => {
    const navigate = useNavigate();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token || user.role !== "student") {
            navigate("/login");
            return;
        }

        loadEnrolledCourses();
    }, [navigate]);

    /** -----------------------------
     * LOAD ONLY ENROLLED COURSES
     * ----------------------------*/
    const loadEnrolledCourses = async () => {
        try {
            setLoading(true);

            const data = await apiFetch("/api/student/enrolled-courses");

            setEnrolledCourses(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error("Failed to load enrolled courses:", err);
            setError(err.message || "Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen">
            <div className="relative flex min-h-screen w-full">

                <StudentSidebar />

                <div className="flex-1">
                    <TopNavbar user={user} />

                    <main className="p-6">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-6">
                                My Enrolled Courses
                            </h1>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                View all your enrolled courses, access meeting links, and download materials.
                            </p>

                            {/* Loading */}
                            {loading ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <p className="text-gray-500">Loading your courses...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <p className="text-red-500">Error: {error}</p>
                                </div>
                            ) : enrolledCourses.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                    <p className="text-gray-500 text-lg">You have not enrolled in any courses yet.</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Title</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructor</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meeting Link</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Materials</th>
                                                </tr>
                                            </thead>

                                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                                {enrolledCourses.map((course) => (
                                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-6 py-4 text-sm">{course.id}</td>
                                                        <td className="px-6 py-4 text-sm font-medium">{course.title}</td>
                                                        <td className="px-6 py-4 text-sm">{course.category_name || "-"}</td>
                                                        <td className="px-6 py-4 text-sm">{course.instructor_name || "-"}</td>

                                                        <td className="px-6 py-4 text-sm max-w-xs">
                                                            <div className="line-clamp-2">{course.short_description || "-"}</div>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm">{course.duration || "-"}</td>
                                                        <td className="px-6 py-4 text-sm">{course.price ? `₹${course.price}` : "-"}</td>

                                                        <td className="px-6 py-4 text-sm">
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full ${
                                                                    course.status === "published"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                            >
                                                                {course.status}
                                                            </span>
                                                        </td>

                                                        {/* MEETING LINK */}
                                                        <td className="px-6 py-4 text-sm">
                                                            {course.zoom_link ? (
                                                                <a
                                                                    href={course.zoom_link}
                                                                    target="_blank"
                                                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                                                                >
                                                                    Join Meeting
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-400">No link</span>
                                                            )}
                                                        </td>

                                                        {/* MATERIAL FILE */}
                                                        <td className="px-6 py-4 text-sm">
                                                          {course.file ? (
    <a
        href={course.file.startsWith("http") ? course.file : `http://localhost:5000${course.file}`}
        target="_blank"
        className="bg-green-600 text-white px-3 py-1 rounded-lg"
    >
        View
    </a>
) : (
    <span className="text-gray-400">No Files</span>
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
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.name || "Student"}
                </span>
            </div>
        </div>
    </header>
);

export default StudentEnrolledCourses;
