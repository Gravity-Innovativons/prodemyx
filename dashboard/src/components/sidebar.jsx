// src/components/Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InstructorSidebar from "./InstructorSidebar";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // detects whether we're in instructor or student area
  const isUser = location.pathname.startsWith("/app/instructor") || location.pathname.startsWith("/app/student");

  // helper for admin active links (exact match)
  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-50 text-blue-600 font-semibold"
      : "text-gray-700 hover:bg-gray-50";

  const adminMenu = [
    { to: "/admindashboard", icon: "dashboard", label: "Dashboard" },
    { to: "/coursemanagement", icon: "import_contacts", label: "Courses" },
    { to: "/usermanagement", icon: "group", label: "Users" },
    // { to: "/reports", icon: "bar_chart", label: "Reports" },
  ];

  // if we're on instructor or student routes, render the user-facing sidebar component
  if (isUser) {
    return <InstructorSidebar />;
  }

  // otherwise render admin sidebar
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCxWtl-5tNpMMJzNDIGbSyHHTqiRcgHH08AVxZY5ICZwuaR041kWC1JPCnpAqwgADOhtZZL_XwOIr63XN3Dnxw2Erv3AgDapmWW11o85kISwbe68jYmMcJ4INFsAkltTFRZSKKHQcXHrcs3fVTMgi_IUUcWIaaIHzzT-W8-9Y2KWKVX-J1npYjXYicNnbDyajguzx3rTRVQij_bJubA2cIwv6ixzIh3m0lGw_WOm6DtfIjahGlGfDAq1WevA2toBG4zbHL9q87XX7M")',
            }}
            aria-hidden
          />
          <div>
            <div className="text-sm font-semibold">Admin Panel</div>
            <div className="text-xs text-gray-500">LMS Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1" aria-label="Admin navigation">
          {adminMenu.map((item) => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${isActive(item.to)}`}
              aria-current={location.pathname === item.to ? "page" : undefined}
            >
              <span className="material-symbols-outlined text-lg" aria-hidden>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom items */}
      <div className="px-4 pb-8">
        {/* Help Center - Commented out as requested */}
        {/* <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
          onClick={() => navigate("/help")}
        >
          <span className="material-symbols-outlined text-lg">help_center</span>
          Help Center
        </button> */}

        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
