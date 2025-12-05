import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { BASE_URL } from "../api.js";

export default function CreateUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Student",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, role } = form;

    if (!firstName || !lastName || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    // backend expects a single "name" field
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: role.toLowerCase(), // backend expects lowercase roles
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create user");

      alert("User created successfully!");
      navigate("/usermanagement");

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light-primary dark:text-text-dark-primary min-h-screen flex w-full">

      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10">
        <div className="max-w-4xl mx-auto">

          {/* PAGE HEADING */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New User</h1>
            <p className="text-text-light-secondary dark:text-text-dark-secondary">
              Fill in the details below to add a new user to the system.
            </p>
          </div>

          {/* FORM */}
          <div className="bg-white dark:bg-card-dark p-6 sm:p-8 rounded-xl border border-border-light dark:border-border-dark">
            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="flex flex-col">
                  <p className="text-sm font-medium pb-2">First Name</p>
                  <input
                    id="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="form-input h-12 rounded p-4"
                    placeholder="Enter first name"
                  />
                </label>

                <label className="flex flex-col">
                  <p className="text-sm font-medium pb-2">Last Name</p>
                  <input
                    id="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="form-input h-12 rounded p-4"
                    placeholder="Enter last name"
                  />
                </label>
              </div>

              {/* Email */}
              <label className="flex flex-col">
                <p className="text-sm font-medium pb-2">Email Address</p>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input h-12 rounded p-4"
                  placeholder="Enter email address"
                />
              </label>

              {/* Password */}
              <label className="flex flex-col">
                <p className="text-sm font-medium pb-2">Password</p>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input h-12 rounded p-4"
                  placeholder="Enter password"
                />
              </label>

              {/* Role */}
              <label className="flex flex-col">
                <p className="text-sm font-medium pb-2">User Role</p>
                <select
                  id="role"
                  value={form.role}
                  onChange={handleChange}
                  className="form-select h-12 rounded p-4"
                >
                  <option>Student</option>
                  <option>Instructor</option>
                  <option>Admin</option>
                </select>
              </label>

              {/* BUTTONS */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  className="h-12 px-6 rounded bg-background-light border"
                  onClick={() => navigate("/usermanagement")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-12 px-6 rounded bg-primary text-white"
                >
                  Create User
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
