import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api.js";
import InstructorSidebar from "../components/InstructorSidebar.jsx";

// 🔐 Token-based API fetch
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

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assigned_courses: 0,
    total_students: 0,
    upcoming_classes: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "instructor") {
      navigate("/login");
    }
  }, [navigate]);

  // Load summary stats
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiFetch("/instructor/dashboard");
        setStats({
          assigned_courses: data.assigned_courses || 0,
          total_students: data.total_students || 0,
          upcoming_classes: data.upcoming_classes || 0,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="bg-background-light font-display text-[#333333] min-h-screen">
      <div className="relative flex min-h-screen w-full">

        <InstructorSidebar />

        {/* MAIN CONTENT */}
        <div className="flex-1">
          <TopNavbar />

          <main className="p-6">
            <h1 className="text-[#111318] text-3xl font-bold mb-6">Dashboard</h1>
            <StatsSection stats={stats} />
            <ChartsAndLists />
          </main>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Navbar ---------------- */
const TopNavbar = () => (
  <header className="flex justify-between items-center border-b bg-white px-6 py-3">
    <input
      className="bg-background-light px-4 h-10 rounded-lg border"
      placeholder="Search courses, users..."
    />
    <div className="flex items-center gap-4">
      <span className="material-symbols-outlined text-xl">notifications</span>
      <div
        className="size-10 rounded-full bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCPp9CSCQemHquzD1XC0S3-n6DQ-Ul8SJwLt3RGkcHUTNIxEJD0fiZazL-cW5yOe6Gr6fE_4Ya8bGDv6uSk_6I6svjn6xQ0RaGmrIiJxOkF8_xJONIC5Y7PAZT18FdX7LTvQyF-aoXmA2JCOiL1BK1PdvQNOMCQVmE1epROI_kYPgzcLopSW2pxrAsp9e3tGD1H59-y8CncVnBZTxasd_0MYLfNc_tjJ7mwPgHgxvXYHHAUeTxjRDV_JZwNSh9pXRAc68mRvgPr34g")',
        }}
      ></div>
    </div>
  </header>
);

/* ---------------- Stats Section ---------------- */
const StatsSection = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <StatBox title="Assigned Courses" value={stats.assigned_courses} />
    <StatBox title="Total Students" value={stats.total_students} />
    <StatBox title="Upcoming Classes" value={stats.upcoming_classes} />
  </div>
);

const StatBox = ({ title, value }) => (
  <div className="p-6 bg-white rounded-xl border">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold text-[#111318]">{value}</p>
  </div>
);

/* ---------------- Charts Section ---------------- */
const ChartsAndLists = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
      <h3 className="text-lg font-semibold mb-4">Active Users</h3>
      <img
        className="w-full h-64 object-contain"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPOxvRpa2Iy6QvuITwqMNwO3O80J_4LZ99dHynTdTz0RC3V_f9Kp5RZfIAV99Z-xC8OEfym7PbxKvyOBzUvuR4gwthZbYJ_1wPo96IOXQHp_CeouqvfRJS17xGLekvCsuxT3ozpgdNLZO8i2zE_iQW9Qxqn5_MV2guuFDAmF8XaeI0B3bTylNVhtbkYPSIuFkSgvpy5zQ1y046hw3w7BckEIG1c26Nsjx9Ei5wcCerap8PClYkC5CavvsJa6GFcYxbQwJcVAYai7U"
        alt="Chart"
      />
    </div> */}

    {/* <div className="bg-white p-6 rounded-xl border">
      <h3 className="text-lg font-semibold mb-4">Enrollment Status</h3>
      <img
        className="w-full h-52 object-contain"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNiM-hBGqC93ps86ez86uTRYOGIkuIwkEkeBEusimKsAdaTmypB7y2xYeZYYMQBnfCZeqCh1g7808kN-TA92R7lzrhPjMLK-Z5duYQzNfQA8Q-Z9EuFNB75qsB3jLCPgL3_odEbPeSdizmOWWUpCR3i_
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNiM-hBGqC93ps86ez86uTRYOGIkuIwkEkeBEusimKsAdaTmypB7y2xYeZYYMQBnfCZeqCh1g7808kN-TA92R7lzrhPjMLK-Z5duYQzNfQA8Q-Z9EuFNB75qsB3jLCPgL3_odEbPeSdizmOWWUpCR3iUzw9xdqDoTwCdiAGgGQOg1RRcisKpzoaqSN375S0lDsWMFpikEjY6YipCBdXo62TJkle5TfOrzUkInVsh1xA2854j4jAEVOajp8L0JUh3fBkPFshkHuy0U"
        alt="Donut Chart"
      />
    </div> */}
  </div>
);

export default InstructorDashboard;