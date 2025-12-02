import React from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../utils/auth";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login"); //
    // notify app about auth change
    window.dispatchEvent(new Event("auth:changed"));
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center transition-colors duration-200"
    >
      {/* أيقونة الخروج */}
      <svg
        className="w-4 h-4 mr-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Logout
    </button>
  );
};

export default LogoutButton;
