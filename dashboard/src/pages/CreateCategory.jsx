import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { BASE_URL } from "../api.js";

export default function CreateCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create category");
        return;
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      setName("");
      setDescription("");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark relative flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="text-gray-500 dark:text-gray-400 cursor-pointer"
              onClick={() => navigate("/admindashboard")}
            >
              Dashboard
            </span>
            <span>/</span>
            <span
              className="text-gray-500 dark:text-gray-400 cursor-pointer"
              onClick={() => navigate("/categories")}
            >
              Categories
            </span>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Create New
            </span>
          </div>

          <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-8 tracking-tight">
            Create New Category
          </h1>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-background-dark p-8 rounded-xl border border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="flex flex-col">
                    <label className="text-gray-800 dark:text-gray-200 text-sm font-medium pb-2">
                      Category Name*
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Leadership Skills"
                      className="form-input rounded-lg border border-gray-300 dark:border-gray-700 
                      text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900/50 h-12 px-4"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-gray-800 dark:text-gray-200 text-sm font-medium pb-2">
                      Category Description
                    </label>
                    <textarea
                      rows="5"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a brief summary"
                      className="form-textarea rounded-lg border border-gray-300 dark:border-gray-700 
                      text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900/50 p-4"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium 
                      text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-lg bg-primary text-white 
                      text-sm font-medium hover:bg-primary/90"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      tips_and_updates
                    </span>
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-semibold">
                    Best Practices
                  </h3>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400">
                      check_circle
                    </span>
                    Keep names concise and clear.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400">
                      check_circle
                    </span>
                    Write a helpful category description.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400">
                      check_circle
                    </span>
                    Avoid jargon unless commonly understood.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {showToast && (
          <div className="fixed bottom-5 right-5 flex items-center gap-4 
          rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <span className="material-symbols-outlined text-success">
                task_alt
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                Success!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                New category created successfully.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
