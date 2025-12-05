import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { apiFetch } from "../api";

export default function CreateCourse() {
  const navigate = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState(""); // <-- NEW
  const [instructorId, setInstructorId] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [scheduleMorning, setScheduleMorning] = useState(true);
  const [scheduleEvening, setScheduleEvening] = useState(false);
  const [scheduleWeekend, setScheduleWeekend] = useState(false);
  const [materialFile, setMaterialFile] = useState(null);
  const [materialPath, setMaterialPath] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPath, setCoverPath] = useState("");

  // backend data
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  // ===== MATERIAL UPLOAD =====
  const handleMaterialUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files allowed.");
      return;
    }

    setMaterialFile(file);
    setUploadingMaterial(true);

    try {
      const formData = new FormData();
      formData.append("material", file);

      const res = await fetch("http://localhost:5000/api/upload-material", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      let path = data.filePath || "";
      if (!path.startsWith("/")) path = "/" + path;

      setMaterialPath(path);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingMaterial(false);
    }
  };

  // ===== COVER UPLOAD =====
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG, WEBP allowed.");
      return;
    }

    setCoverFile(file);
    setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("cover", file);

      const res = await fetch("http://localhost:5000/api/upload-cover", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Cover upload failed");
        return;
      }

      let path = data.filePath || "";
      if (!path.startsWith("/")) path = "/" + path;

      setCoverPath(path);
    } catch (err) {
      alert("Cover upload failed: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      try {
        const [cats, users] = await Promise.all([
          apiFetch("/api/categories", { method: "GET" }),
          apiFetch("/api/users", { method: "GET" }),
        ]);

        if (!mounted) return;

        setCategories(Array.isArray(cats) ? cats : []);
        setInstructors(
          Array.isArray(users) ? users.filter((u) => u.role === "instructor") : []
        );
      } catch (err) {
        setCategories([]);
        setInstructors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => { mounted = false; };
  }, []);

  async function handleSubmit(status = "published") {
    if (!title.trim() || !categoryId) {
      alert("Please provide a title and select a category.");
      return;
    }

    let photoToSend = coverPath || null;
    if (photoToSend && !photoToSend.startsWith("/")) photoToSend = "/" + photoToSend;

    const payload = {
      title: title.trim(),
      short_description: shortDescription || null,
      long_description: longDescription || null,
      category_id: Number(categoryId),
      price: price ? Number(price) : null, // <-- NEW
      zoom_link: zoomLink.trim() || null,
      instructor_id: instructorId ? Number(instructorId) : null,
      schedule_morning: !!scheduleMorning,
      schedule_evening: !!scheduleEvening,
      schedule_weekend: !!scheduleWeekend,
      material_path: materialPath || null,
      photo: photoToSend,
      status,
    };

    setSubmitting(true);

    try {
      await apiFetch("/api/courses", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setToastVisible(true);
      setTimeout(() => navigate("/coursemanagement"), 900);
    } catch (err) {
      alert("Failed to create course: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark relative flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">

          {/* breadcrumbs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <a
              className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary cursor-pointer"
              onClick={() => navigate("/coursemangement")}
            >
              Courses
            </a>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-900 dark:text-white">Create New Course</span>
          </div>

          {/* header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-gray-900 dark:text-white text-3xl font-bold">Create New Course</h1>
              <p className="text-gray-500 dark:text-gray-400">Fill in the details below.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border rounded-lg"
                disabled={submitting}
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("published")}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg"
                disabled={submitting}
              >
                Publish Course
              </button>
            </div>
          </div>

          {/* form grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT */}
            <div className="lg:col-span-2 flex flex-col gap-8">

              {/* COURSE INFORMATION */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Course Information</h3>
                </div>

                <div className="p-6 grid gap-6">

                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Course Title</p>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Introduction to Digital Marketing"
                      className="form-input h-11 px-3 rounded-lg border dark:border-gray-700"
                    />
                  </label>

                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Short Description</p>
                    <textarea
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      className="form-textarea min-h-20 p-3 rounded-lg border dark:border-gray-700"
                    />
                  </label>

                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Long Description</p>
                    <textarea
                      value={longDescription}
                      onChange={(e) => setLongDescription(e.target.value)}
                      className="form-textarea min-h-32 p-3 rounded-lg border dark:border-gray-700"
                    />
                  </label>

                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Course Category</p>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="form-select h-11 px-3 rounded-lg border dark:border-gray-700"
                    >
                      <option value="">Select a category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>

                  {/* PRICE FIELD (Option C - placed here) */}
                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Course Price</p>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g., 499.00"
                      className="form-input h-11 px-3 rounded-lg border dark:border-gray-700"
                    />
                  </label>

                </div>
              </div>

              {/* COVER PHOTO */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Course Cover Photo</h3>
                </div>

                <div className="p-6">
                  <div className="flex justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-35 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800">
                      <div className="pt-5 pb-6 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-500">image</span>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG, WEBP</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverUpload}
                      />
                    </label>
                  </div>

                  {coverPath && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center gap-3">
                      <img
                        src={`http://localhost:5000${coverPath}`}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">Cover uploaded</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SCHEDULING */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Scheduling & Logistics</h3>
                </div>

                <div className="p-6 grid gap-6">
                  <div>
                    <p className="text-sm font-medium pb-2">Course Schedule</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={scheduleMorning}
                          onChange={(e) => setScheduleMorning(e.target.checked)}
                          className="form-checkbox"
                        />
                        <span>Morning</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={scheduleEvening}
                          onChange={(e) => setScheduleEvening(e.target.checked)}
                          className="form-checkbox"
                        />
                        <span>Evening</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={scheduleWeekend}
                          onChange={(e) => setScheduleWeekend(e.target.checked)}
                          className="form-checkbox"
                        />
                        <span>Weekend</span>
                      </label>
                    </div>
                  </div>

                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Zoom Meeting Link</p>
                    <input
                      value={zoomLink}
                      onChange={(e) => setZoomLink(e.target.value)}
                      className="form-input h-11 px-3 rounded-lg border dark:border-gray-700"
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1 flex flex-col gap-8">

              {/* MATERIALS */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Course Materials</h3>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800">
                      <div className="pt-5 pb-6 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-500">cloud_upload</span>
                        <p className="text-sm">Click to upload or drag</p>
                        <p className="text-xs">PDF only</p>
                      </div>
                      <input className="hidden" type="file" onChange={handleMaterialUpload} />
                    </label>
                  </div>

                  {materialPath && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium">Material Uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* INSTRUCTOR */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold">Instructor</h3>
                </div>

                <div className="p-6">
                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Assign Instructor</p>
                    <select
                      value={instructorId}
                      onChange={(e) => setInstructorId(e.target.value)}
                      className="form-select h-11 px-3 rounded-lg border dark:border-gray-700"
                    >
                      <option value="">Select an instructor...</option>
                      {instructors.map((u) => (
                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {toastVisible && (
                <div className="p-4 bg-success/10 text-success rounded-lg">
                  <p className="font-medium text-sm">Success!</p>
                  <p className="text-sm">Course created successfully.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
