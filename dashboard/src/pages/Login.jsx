import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // ✔ NEW: REAL LOGIN SYSTEM
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ✔ Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🚀 Redirect to Dashboard (FOR ALL ROLES)
      if (data.user.role === "admin") {
  window.location.href = "/admindashboard";
} else if (data.user.role === "instructor") {
  window.location.href = "/instructor/dashboard";
} else {
  window.location.href = "/student/dashboard";
}


    } catch (err) {
      console.error("Login error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f3f9] font-display px-4">

      {/* Card */}
      <div className="w-full max-w-xl bg-white p-10 rounded-xl shadow-md border border-gray-200">

        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="mx-auto bg-primary p-3 rounded-xl inline-flex">
            <span className="material-symbols-outlined text-white text-3xl">
              school
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-3">Prodemyx</h1>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-2">
          Login
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Please enter your credentials to sign in.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block pb-1 font-medium">Username or Email</label>
            <input
              type="email"
              className="w-full h-12 px-4 border rounded-lg focus:ring-primary focus:ring-2"
              placeholder="Enter your username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block pb-1 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="w-full h-12 px-4 border rounded-lg focus:ring-primary focus:ring-2"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary" />
              Remember Me
            </label>

            <a href="#" className="text-primary font-medium hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-10">
          © 2025 Prodemyx. All rights reserved.
        </p>
      </div>
    </div>
  );
}