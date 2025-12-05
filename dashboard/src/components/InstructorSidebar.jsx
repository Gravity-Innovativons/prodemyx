import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function InstructorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/app/login");
  };

  const menuItems = [
    {
      icon: "dashboard",
      label: "Dashboard",
      path: "/app/instructor/dashboard",
      active: true,
    },
    {
      icon: "person",
      label: "My Profile",
      path: "/app/instructor/profile",
      active: true,
    },
    {
      icon: "school",
      label: "Assigned Courses",
      path: "/app/instructor/assigned-courses",
      active: true,
    },
    // Commented out menu items as requested
    // {
    //   icon: "import_contacts",
    //   label: "Enrolled Courses",
    //   path: "/instructor/enrolled-courses",
    //   active: false,
    // },
    // {
    //   icon: "bookmark",
    //   label: "Wishlist",
    //   path: "/instructor/wishlist",
    //   active: false,
    // },
    // {
    //   icon: "star_rate",
    //   label: "Reviews",
    //   path: "/instructor/reviews",
    //   active: false,
    // },
    // {
    //   icon: "settings",
    //   label: "Settings",
    //   path: "/instructor/settings",
    //   active: false,
    // },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-primary">ProdemyX</h1>
        <p className="text-sm text-gray-500">Instructor Portal</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems
          .filter((item) => item.active)
          .map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                  ? "bg-primary text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {/* Help Center - Commented out as requested */}
        {/* <button
          onClick={() => navigate("/instructor/help")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2"
        >
          <span className="material-symbols-outlined text-xl">help_center</span>
          <span className="font-medium">Help Center</span>
        </button> */}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
