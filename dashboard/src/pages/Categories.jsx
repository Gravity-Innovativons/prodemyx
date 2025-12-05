import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api.js";

export default function Categories() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/public/courses`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const courses = await res.json();

        const map = new Map();
        for (const c of courses) {
          const catName = (c.category_name || "").trim() || "Uncategorized";
          const catId = c.category_id ?? catName;

          if (!map.has(catName)) {
            map.set(catName, { id: catId, name: catName, courses: [] });
          }
          map.get(catName).courses.push(c);
        }

        const groupsArr = Array.from(map.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setGroups(groupsArr);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Failed to load categories and courses.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      <h1 className="text-center text-3xl font-bold text-gray-900 mb-12">
        Categories
      </h1>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {!loading && error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && groups.length === 0 && (
        <p className="text-center text-gray-500">No categories or courses found</p>
      )}

      {!loading &&
        !error &&
        groups.map((g) => (
          <section key={g.name} className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {g.name}
            </h2>

            {g.courses.length === 0 ? (
              <p className="text-gray-500 mb-8">
                No courses in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {g.courses.map((course) => (
                  <article
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="cursor-pointer bg-white rounded-2xl border shadow-md hover:shadow-xl transition p-6"
                  >
                    <img
                      src={course.photo || "/default.jpg"}
                      alt={course.title}
                      className="h-40 w-full object-cover rounded-xl mb-4"
                      onError={(e) => {
                        e.target.src = "/default.jpg";
                      }}
                    />

                    <h3 className="text-lg font-bold text-gray-900">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mt-1">
                      {course.short_discription || "No description available"}
                    </p>

                    <p className="text-primary font-semibold mt-3">
                      {course.price == null ? "Free" : `₹${course.price}`}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
    </div>
  );
}
