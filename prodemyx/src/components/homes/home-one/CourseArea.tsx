// src/pages/CourseArea.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../../api";

interface Course {
  id: number;
  title: string;
  category: string;
  price: number;
  thumb: string;
}

const CourseArea = () => {
  const [backendCourses, setBackendCourses] = useState<Course[]>([]);

  // Fetch all courses
  useEffect(() => {
    fetch(`${API_BASE_URL}/public/courses`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setBackendCourses(
            data.map((c: any) => ({
              id: c.id,
              title: c.title,
              category: c.category_name,
              price: c.price || 0,
              thumb: c.photo ? `${API_BASE_URL}/uploads/course-covers/${c.photo}` : "/assets/img/courses/default.png",
            }))
          );
        } else {
          console.error("API response is not an array:", data);
          setBackendCourses([]); // Set to empty array to prevent .map error
        }
      })
      .catch((error) => {
        console.error("Failed to fetch courses:", error);
        setBackendCourses([]); // Ensure component doesn't crash on fetch error
      });
  }, []);

  return (
    <section className="all-courses-area section-py-120">
      <div className="container">
        {/* REAL ROUTER BUTTONS */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Link
            to="/courses"
            className="btn"
            style={{
              marginRight: "10px",
              border: "1px solid #333",
              background: "#333",
              color: "white",
            }}
          >
            All Courses
          </Link>

          <Link
            to="/categories"
            className="btn"
            style={{
              border: "1px solid #333",
              background: "white",
              color: "#333",
            }}
          >
            View All
          </Link>
        </div>

        {/* ALL COURSES LIST */}
        <div className="row row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1">
          {backendCourses.map((item) => (
            <div key={item.id} className="col">
              
              {/* MAKE THE ENTIRE CARD CLICKABLE */}
              <Link to={`/course/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="courses__item shine__animate-item" style={{ cursor: "pointer" }}>
                  <div className="courses__item-thumb">
                    <img src={item.thumb} alt="img" />
                  </div>

                  <div className="courses__item-content">
                    <h5 className="title">{item.title}</h5>
                    <p>{item.category}</p>
                    <h5 className="price">
                      {item.price === 0 ? "Free" : "₹" + item.price}
                    </h5>
                  </div>
                </div>
              </Link>
              {/* END OF CLICKABLE CARD */}

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseArea;
