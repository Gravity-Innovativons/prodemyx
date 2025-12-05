import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import { BASE_URL } from "../api.js";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [completion, setCompletion] = useState([]);
  const [loading, setLoading] = useState(true);

  // Your global fetch wrapper
  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      ...options,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryRes, activityRes, completionRes] = await Promise.all([
          apiFetch("/api/reports/summary"),
          apiFetch("/api/reports/activity"),
          apiFetch("/api/reports/completion")
        ]);

        setSummary(summaryRes);
        setActivity(activityRes);
        setCompletion(completionRes);
      } catch (err) {
        console.error(err);
        alert("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full font-display bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View insights on user activity, course performance & usage.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* KPI CARDS */}
          <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">Total Active Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {summary.total_active_users}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">Avg. Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {summary.avg_completion_rate}%
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">Courses in Progress</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {summary.courses_in_progress}
            </p>
          </div>
        </div>

        {/* Line Chart */}
        <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mb-8">
          <h3 className="text-lg font-bold mb-4">User Activity (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="active_users"
                  stroke="#2b6cee"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Table */}
        <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto p-6">
          <h3 className="text-lg font-bold mb-4">Course Completion Details</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">User Name</th>
                <th className="px-6 py-3">Course Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Completion Date</th>
                <th className="px-6 py-3">Score</th>
              </tr>
            </thead>

            <tbody>
              {completion.map((row, i) => (
                <tr
                  key={i}
                  className="border-b dark:border-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <td className="px-6 py-4 font-medium">{row.username}</td>
                  <td className="px-6 py-4">{row.course}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : row.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                    >
                      {row.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {row.completion_date || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {row.score !== null ? `${row.score}%` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}