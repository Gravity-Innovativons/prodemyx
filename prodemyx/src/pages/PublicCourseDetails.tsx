import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/features/cartSlice";

interface Course {
  id: number;
  title: string;
  long_description?: string;
  price: number;
  photo?: string;
}

export default function PublicCourseDetails() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [suggested, setSuggested] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(false);

  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadCourse();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  async function loadCourse() {
    // FIX: Prevent old data from flashing
    setCourse(null);
    setSuggested([]);
    setExpanded(false);
    setLoading(true);

    try {
      const data = await apiFetch(`/public/courses/${id}`);
      setCourse(data || null);

      const all = await apiFetch(`/public/courses`);
      const recommended = all
        .filter((c: Course) => c.id !== Number(id))
        .slice(0, 3);

      setSuggested(recommended);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!course)
    return <div className="p-10 text-center text-red-500">Course not found.</div>;

  return (
    <>
      {/* COURSE DETAILS */}
      <section className="courses__details-area section-py-120">
        <div className="container">
          <div className="row align-items-center">

            {/* LEFT IMAGE */}
            <div className="col-xl-6 col-lg-6">
              <div className="courses__details-thumb">
                <img
  src={course.photo || "/assets/img/courses/courses_details.jpg"}
  alt={course.title}
  style={{ width: "100%", borderRadius: "10px" }}
/>

              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="col-xl-6 col-lg-6">
              <div className="courses__details-content">

                <h2 className="title">{course.title}</h2>

                {/* LONG DESCRIPTION */}
                <div className="long-description mb-4" style={{ maxWidth: "90%" }}>
                  <p style={{ whiteSpace: "pre-line", lineHeight: "1.7" }}>
                    {expanded
                      ? course.long_description
                      : (course.long_description || "").slice(0, 300) +
                      ((course.long_description || "").length > 300 ? "..." : "")}
                  </p>

                  {course.long_description &&
                    course.long_description.length > 300 && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          color: "#0047ff",
                          fontWeight: 600,
                          cursor: "pointer",
                          marginTop: "5px",
                          fontSize: "15px",
                        }}
                      >
                        {expanded ? "See Less ▲" : "See More ▼"}
                      </button>
                    )}
                </div>

                <h5 className="price">Rs {course.price}</h5>

                {/* ADD TO CART */}
                <button
                  onClick={() => {
                    dispatch(
                      addToCart({
                        id: course.id,
                        title: course.title,
                        price: course.price,
                        quantity: 1,
                        thumb: course.photo || "/assets/img/courses/courses_details.jpg",
                        user_name: "",
                        user_email: "",
                      })
                    );
                    navigate("/cart");
                  }}
                  className="w-[360px] h-[55px]"
                  style={{
                    backgroundColor: "#F9C93A",
                    color: "#000",
                    padding: "4px 24px",
                    fontWeight: 600,
                    borderRadius: "50px",
                    border: "2px solid #000",
                    boxShadow: "4px 4px 0 #000",
                    cursor: "pointer",
                    fontSize: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  Add to Cart
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* YOU MAY ALSO LIKE */}
      <section className="section-py-80">
        <div className="container">
          <h3 className="text-3xl font-bold mb-6">You May Also Like</h3>

          <div className="row">
            {suggested.length === 0 && (
              <p className="text-gray-500">No recommended courses available.</p>
            )}

            {suggested.map((s) => (
              <div key={s.id} className="col-xl-4 col-lg-4 col-md-6 mb-4">
                <div
                  className="courses__item p-3 rounded-lg"
                  style={{
                    border: "1px solid #eee",
                    background: "#fff",
                    borderRadius: "12px",
                  }}
                >
                  <img
  src={s.photo || "/assets/img/courses/courses_details.jpg"}
  alt={s.title}
  className="mb-3 rounded"
  style={{ width: "100%", borderRadius: "10px" }}
/>

                  <h4 className="text-lg font-semibold">{s.title}</h4>

                  {/* FIXED: use s.long_description, NOT course.long_description */}
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {course.long_description || "No description"}
                  </p>

                  <h5 className="price mt-3">Rs {s.price}</h5>

                  {/* VIEW COURSE */}
                  <button
                    onClick={() => {
    navigate(`/course/${s.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
}}

                    className="mt-3 w-[140px] h-[45px]"
                    style={{
                      backgroundColor: "#F9C93A",
                      borderRadius: "50px",
                      border: "2px solid #000",
                      boxShadow: "3px 3px 0 #000",
                      fontWeight: 600,
                      color: "#000",
                    }}
                  >
                    View Course
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
