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

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_courses: 0,
    enrolled_courses: 0,
    completed_courses: 0,
    in_progress: 0,
  });

  // Validate student login
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "student") {
      navigate("/login");
    }
  }, [navigate]);

  // Load dashboard statistics
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiFetch("/api/student/dashboard");

        setStats({
          total_courses: data.total_courses,
          enrolled_courses: data.enrolled_courses,
          completed_courses: data.completed_courses,
          in_progress: data.in_progress,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    loadDashboard();
  }, []);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen">
      <div className="relative flex min-h-screen w-full">
        <StudentSidebar />

        {/* MAIN CONTENT */}
        <div className="flex-1">
          <TopNavbar />

          <main className="p-6">
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-6">
              Dashboard
            </h1>

            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome back, {user.name || "Student"}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Continue your learning journey and track your progress.
              </p>
            </div>

            {/* Stats Section */}
            <StatsSection stats={stats} />

            {/* Charts section (hidden for now) */}
            <ChartsAndLists />
          </main>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Navbar ---------------- */
const TopNavbar = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
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
            {user.name || "Student"}
          </span>
        </div>
      </div>
    </header>
  );
};

/* ---------------- Stats Section ---------------- */
const StatsSection = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <StatBox title="Total Courses" value={stats.total_courses} icon="school" />
    <StatBox
      title="Enrolled Courses"
      value={stats.enrolled_courses}
      icon="book"
    />
    <StatBox
      title="Completed"
      value={stats.completed_courses}
      icon="check_circle"
    />
    <StatBox
      title="In Progress"
      value={stats.in_progress}
      icon="pending"
    />
  </div>
);

const StatBox = ({ title, value, icon }) => (
  <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <span className="material-symbols-outlined text-primary">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

/* ---------------- Charts Section ---------------- */
const ChartsAndLists = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"></div>
);

export default StudentDashboard;
