import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InstructorSidebar from "../components/InstructorSidebar";
import Sidebar from "../components/sidebar";
import { BASE_URL } from "../api.js";

export default function CourseManagement() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'edit'

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
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "API error");
    }
    return data;
  };

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(loggedInUser);
    loadCourses(loggedInUser);
  }, []);

  const loadCourses = async (currentUser) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch("/api/courses");
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError(err.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Delete this course? This action cannot be undone.")) return;

    setBusyId(courseId);
    try {
      await apiFetch(`/api/courses/${courseId}`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setShowModal(false);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete course.");
    } finally {
      setBusyId(null);
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditCourse = (course) => {
    navigate(`/editcourse/${course.id}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark relative flex min-h-screen w-full">
      {/* Sidebar */}
      {user?.role === 'admin' ? <Sidebar /> : <InstructorSidebar />}

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user?.role === 'admin' ? 'Course Management' : 'Enrolled Courses'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {user?.role === 'admin'
                  ? "Create, edit, and manage all courses in the portal."
                  : "Here are the courses you are enrolled in."}
              </p>
            </div>

            {user?.role === 'admin' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/createcategory")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <span className="text-lg">＋</span> Create New Category
                </button>
                <button
                  onClick={() => navigate("/createcourse")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <span className="text-lg">＋</span> Create New Course
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="w-full overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading courses…</div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">Error: {error}</div>
              ) : courses.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No courses found.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      {user?.role === 'admin' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {course.id}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {course.title}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {course.category_name || "-"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {course.instructor_name || "-"}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${course.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {course.status || 'draft'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {course.price ? `₹${course.price}` : '-'}
                        </td>

                        {user?.role === 'admin' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleViewDetails(course)}
                                className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
                              >
                                View
                              </button>

                              <button
                                onClick={() => handleEditCourse(course)}
                                className="px-2 py-1 rounded bg-gray-100 text-xs hover:bg-gray-200"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(course.id)}
                                className="text-red-500 hover:text-red-700"
                                disabled={busyId === course.id}
                              >
                                {busyId === course.id ? "..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Course Details Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Course Details
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
                    Course ID
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCourse.id}</p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCourse.title}</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCourse.category_name || '-'}</p>
                </div>

                {/* Instructor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instructor
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCourse.instructor_name || '-'}</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span className={`px-2 py-1 text-xs rounded-full ${selectedCourse.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {selectedCourse.status || 'draft'}
                  </span>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCourse.price ? `₹${selectedCourse.price}` : '-'}</p>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCourse.duration || '-'}</p>
                </div>

                {/* Zoom Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zoom Link
                  </label>
                  {selectedCourse.zoom_link ? (
                    <a href={selectedCourse.zoom_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {selectedCourse.zoom_link}
                    </a>
                  ) : (
                    <p className="text-gray-900 dark:text-white">-</p>
                  )}
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Short Description
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCourse.short_description || '-'}</p>
                </div>

                {/* Long Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Long Description
                  </label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedCourse.long_description || '-'}</p>
                </div>

                {/* Photo */}
                {selectedCourse.photo && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Photo
                    </label>
                    <img
                      src={selectedCourse.photo.startsWith('http') ? selectedCourse.photo : `${BASE_URL}${selectedCourse.photo}`}
                      alt={selectedCourse.title}
                      className="w-full max-w-md rounded-lg"
                    />
                  </div>
                )}

                {/* Material File */}
                {selectedCourse.file && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Material
                    </label>
                    <a
                      href={selectedCourse.file.startsWith('http') ? selectedCourse.file : `${BASE_URL}${selectedCourse.file}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download Material
                    </a>
                  </div>
                )}

                {/* Created At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Created At
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCourse.created_at ? new Date(selectedCourse.created_at).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => handleEditCourse(selectedCourse)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Edit Course
                  </button>
                  <button
                    onClick={() => handleDelete(selectedCourse.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    disabled={busyId === selectedCourse.id}
                  >
                    {busyId === selectedCourse.id ? "Deleting..." : "Delete Course"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}