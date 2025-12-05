import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { apiFetch } from "../api";

export default function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();

  // form state
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState(""); // <-- NEW
  const [instructorId, setInstructorId] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [scheduleMorning, setScheduleMorning] = useState(false);
  const [scheduleEvening, setScheduleEvening] = useState(false);
  const [scheduleWeekend, setScheduleWeekend] = useState(false);

  // files
  const [materialFile, setMaterialFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // existing
  const [existingMaterialUrl, setExistingMaterialUrl] = useState("");
  const [existingCoverUrl, setExistingCoverUrl] = useState("");

  // backend
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // ui
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [cats, users, course] = await Promise.all([
          apiFetch("/api/categories", { method: "GET" }),
          apiFetch("/api/users", { method: "GET" }),
          apiFetch(`/public/courses/${id}`, { method: "GET" }),
        ]);

        if (!mounted) return;

        setCategories(cats);
        setInstructors(users.filter((u) => u.role === "instructor"));

        if (course) {
          setTitle(course.title || "");
          setShortDescription(course.short_description || "");
          setLongDescription(course.long_description || "");
          setCategoryId(course.category_id || "");
          setPrice(course.price || ""); // <-- NEW
          setInstructorId(course.instructor_id || "");
          setZoomLink(course.zoom_link || "");

          setScheduleMorning(!!course.schedule_morning);
          setScheduleEvening(!!course.schedule_evening);
          setScheduleWeekend(!!course.schedule_weekend);

          setExistingCoverUrl(course.photo || "");
          setExistingMaterialUrl(course.material_url || "");
        }
      } catch (err) {
        alert("Failed to load course.");
        navigate("/coursemanagement");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [id, navigate]);

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setExistingCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleMaterialSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setMaterialFile(file);
  };

  async function handleSubmit(status = "published") {
    if (!title.trim() || !categoryId) {
      alert("Missing title/category");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("short_description", shortDescription);
      formData.append("long_description", longDescription);
      formData.append("category_id", categoryId);
      formData.append("price", price); // <-- NEW
      formData.append("instructor_id", instructorId);
      formData.append("zoom_link", zoomLink);

      formData.append("schedule_morning", scheduleMorning);
      formData.append("schedule_evening", scheduleEvening);
      formData.append("schedule_weekend", scheduleWeekend);

      formData.append("status", status);

      if (coverFile) formData.append("photo", coverFile);
      if (materialFile) formData.append("material", materialFile);

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "PUT",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      setToastVisible(true);
      setTimeout(() => navigate("/coursemanagement"), 900);
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">

          {/* breadcrumbs */}
          <div className="flex gap-2 mb-6">
            <a onClick={() => navigate("/coursemanagement")} className="text-gray-500 hover:text-primary cursor-pointer">
              Courses
            </a>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">Edit Course</span>
          </div>

          {/* header */}
          <div className="flex justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Course</h1>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                className="px-4 py-2 text-sm font-medium bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700"
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
                Update Course
              </button>
            </div>
          </div>

          {/* form grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 flex flex-col gap-8">

              {/* COURSE INFO */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold">Course Information</h3>
                </div>

                <div className="p-6 grid gap-6">

                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Course Title</p>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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

                  {/* PRICE FIELD (Option C) */}
                  <label className="flex flex-col w-full">
                    <p className="text-sm font-medium pb-2">Course Price</p>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="form-input h-11 px-3 rounded-lg border dark:border-gray-700"
                    />
                  </label>

                </div>
              </div>

              {/* COVER PHOTO */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold">Course Cover Photo</h3>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full h-35 border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <div className="pt-5 pb-6 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-500">image</span>
                        <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
                    </label>
                  </div>

                  {existingCoverUrl && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center gap-3">
                      <img src={existingCoverUrl} className="w-16 h-16 rounded object-cover" />
                      <div>
                        <p className="text-sm font-medium">Current Cover</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SCHEDULING */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold">Scheduling & Logistics</h3>
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

            {/* RIGHT SIDE */}
            <div className="lg:col-span-1 flex flex-col gap-8">

              {/* MATERIALS */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold">Course Materials</h3>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full h-48 border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <div className="pt-5 pb-6 text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-500">cloud_upload</span>
                        <p className="text-sm">Click to upload</p>
                      </div>
                      <input className="hidden" type="file" onChange={handleMaterialSelect} />
                    </label>
                  </div>

                  {(existingMaterialUrl || materialFile) && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium">
                        {materialFile ? materialFile.name : "Current Material"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* INSTRUCTOR */}
              <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
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

              {/* SUCCESS TOAST */}
              {toastVisible && (
                <div className="p-4 bg-success/10 text-success rounded-lg">
                  <p className="font-medium text-sm">Success!</p>
                  <p className="text-sm">Course updated successfully.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
