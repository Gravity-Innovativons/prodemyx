import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api";
import "../styles/fix-categories.css";

type Course = {
  id: number;
  title: string;
  short_description?: string;
  short_discription?: string;
  price?: number | null;
  photo?: string | null;
  category_id?: number | null;
  category_name?: string | null;
};

type Category = {
  id: number;
  name: string;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<number | "all">("all");

  useEffect(() => {
    loadCategories();
    loadCourses();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/public/categories`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  }

  async function loadCourses() {
    try {
      const res = await fetch(`${API_BASE_URL}/public/courses`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses([]);
    }
  }

  const filteredCourses =
    activeTab === "all"
      ? courses
      : courses.filter((c) => c.category_id === activeTab);

  return (
    <div className="category-page-container">

      {/* -------- TITLE -------- */}
      <h2 className="category-title">Explore Our World's Best Courses</h2>
      <p className="category-subtitle">
        ProdemyX is built for the next generation of engineers — the ones who want
        to build things that actually run.
      </p>

      {/* -------- TABS -------- */}
      <div className="category-tabs">
        <button
          className={activeTab === "all" ? "tab-active" : "tab"}
          onClick={() => setActiveTab("all")}
        >
          All Courses
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={activeTab === cat.id ? "tab-active" : "tab"}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Underline */}
      <div className="tab-underline"></div>

      {/* -------- COURSE GRID -------- */}
      <div className="course-grid">
        {filteredCourses.map((course) => (
          <div className="course-card" key={course.id}>

            <div className="course-img-wrapper">
              <img
                src={course.photo || "/assets/img/courses/default.png"}
                alt={course.title}
                className="course-img"
              />
            </div>

            <div className="course-content">
              <h4 className="course-title">{course.title}</h4>

              <p className="course-description">
                {course.short_discription ||
                  course.short_description ||
                  "No description available"}
              </p>

              <div className="course-footer">
                <Link to={`/course/${course.id}`} className="read-more-btn">Read More →</Link>

                <span className="course-price">
                  {course.price === 0 || course.price === null
                    ? "Free"
                    : `₹${course.price}`}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}









