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
    total_users: 0,
    total_courses: 0,
    total_enrollments: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "student") {
      navigate("/login");
    }
  }, [navigate]);

  // Load summary stats
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiFetch("/api/reports/summary");
        setStats({
          total_users: data.total_users,
          total_courses: data.total_courses,
          total_enrollments: data.total_enrollments,
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

            {/* Welcome Section */}
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

            {/* Charts Section */}
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
    <StatBox title="Enrolled Courses" value={stats.total_enrollments} icon="book" />
    <StatBox title="Completed" value="12" icon="check_circle" />
    <StatBox title="In Progress" value="5" icon="pending" />
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
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Learning Progress
      </h3>
      <img
        className="w-full h-64 object-contain"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPOxvRpa2Iy6QvuITwqMNwO3O80J_4LZ99dHynTdTz0RC3V_f9Kp5RZfIAV99Z-xC8OEfym7PbxKvyOBzUvuR4gwthZbYJ_1wPo96IOXQHp_CeouqvfRJS17xGLekvCsuxT3ozpgdNLZO8i2zE_iQW9Qxqn5_MV2guuFDAmF8XaeI0B3bTylNVhtbkYPSIuFkSgvpy5zQ1y046hw3w7BckEIG1c26Nsjx9Ei5wcCerap8PClYkC5CavvsJa6GFcYxbQwJcVAYai7U"
        alt="Chart"
      />
    </div> */}

    {/* <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Course Status
      </h3>
      <img
        className="w-full h-52 object-contain"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNiM-hBGqC93ps86ez86uTRYOGIkuIwkEkeBEusimKsAdaTmypB7y2xYeZYYMQBnfCZeqCh1g7808kN-TA92R7lzrhPjMLK-Z5duYQzNfQA8Q-Z9EuFNB75qsB3jLCPgL3_odEbPeSdizmOWWUpCR3iUzw9xdqDoTwCdiAGgGQOg1RRcisKpzoaqSN375S0lDsWMFpikEjY6YipCBdXo62TJkle5TfOrzUkInVsh1xA2854j4jAEVOajp8L0JUh3fBkPFshkHuy0U"
        alt="Donut Chart"
      />
    </div> */}
  </div>
);

export default StudentDashboard;