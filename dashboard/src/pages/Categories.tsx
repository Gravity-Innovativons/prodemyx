import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api.js";

type Course = {
  id: number;
  title: string;
  short_discription?: string; // note backend uses this name in server.js
  price?: number | null;
  photo?: string | null;
  category_id?: number | null;
  category_name?: string | null;
};

type CategoryGroup = {
  id: number | string;
  name: string;
  courses: Course[];
};

export default function Categories() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // public endpoint that returns all courses with category_name
        const res = await fetch(`${BASE_URL}/public/courses`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const courses: Course[] = await res.json();

        // group by category_name (fallback to "Uncategorized")
        const map = new Map<string, CategoryGroup>();
        for (const c of courses) {
          const catName = c.category_name?.trim() || "Uncategorized";
          const catId = c.category_id ?? catName;
          if (!map.has(catName)) {
            map.set(catName, { id: catId, name: catName, courses: [] });
          }
          map.get(catName)!.courses.push(c);
        }

        // convert to array sorted by name
        const groupsArr = Array.from(map.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setGroups(groupsArr);
      } catch (err: any) {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{g.name}</h2>

            {g.courses.length === 0 ? (
              <p className="text-gray-500 mb-8">No courses in this category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {g.courses.map((course) => (
                  <article
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="cursor-pointer bg-white rounded-2xl border shadow-md hover:shadow-xl transition p-6"
                  >
                    <img
                      src={(course.photo as string) || "/default.jpg"}
                      alt={course.title}
                      className="h-40 w-full object-cover rounded-xl mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default.jpg";
                      }}
                    />

                    <h3 className="text-lg font-bold text-gray-900">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mt-1">
                      {course.short_discription || "No description available"}
                    </p>

                    <p className="text-primary font-semibold mt-3">
                      {course.price === 0 || course.price === null || course.price === undefined
                        ? "Free"
                        : `₹${course.price}`}
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
