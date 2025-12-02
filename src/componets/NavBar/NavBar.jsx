import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getStoredRole } from "../../utils/auth";
import LogoutButton from "../Logout/LogoutButton";
import logo from "../../../icon/icon.png";
import api from "../../utils/api";

export default function NavBar() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: "", email: "" });
  const profileRef = useRef(null);

  const role = getStoredRole();

  const adminLinks = [
    { to: "/users", label: "Users", icon: "👥" },
    { to: "/teachers", label: "Teachers", icon: "👨‍🏫" },
    { to: "/students", label: "Students", icon: "👨‍🎓" },
    { to: "/levels", label: "Levels", icon: "📊" },
    { to: "/assignments", label: "Assignments", icon: "📝" },
    { to: "/signup", label: "SignUp", icon: "➕" },
  ];

  const teacherLinks = [
    { to: "/teacher/students", label: "My Students", icon: "👨‍🎓" },
    { to: "/teacher/levels", label: "My Levels", icon: "📊" },
    { to: "/teacher/exams", label: "My Exams", icon: "📝" },
    { to: "/teacher/report", label: "My Reports", icon: "📈" },
  ];

  const studentLinks = [
    { to: "/student/levels", label: "My Levels", icon: "📊" },
    { to: "/student/stats", label: "Statistics", icon: "📚" },
  ];

  const links =
    role === "ADMIN"
      ? adminLinks
      : role === "TEACHER"
      ? teacherLinks
      : role === "STUDENT"
      ? studentLinks
      : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchUserProfile() {
    try {
      const response = await api.get("/auth/profile");
      console.log("Profile Response:", response);

      if (response.data && response.data.data && response.data.data.user) {
        setUserProfile(response.data.data.user);
      } else if (response.data) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const getInitial = () => {
    if (userProfile.name) {
      return userProfile.name.charAt(0).toUpperCase();
    }
    if (userProfile.fullName) {
      return userProfile.fullName.charAt(0).toUpperCase();
    }
    if (userProfile.email) {
      return userProfile.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r rounded-xl shadow-lg">
              <img src={logo} alt="Level Up" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-main to-lime-700 bg-clip-text text-transparent">
                <Link to="/">Level Up</Link>
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Education Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {links.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center px-4 py-2.5 rounded-xl font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <span className="text-lg mr-2 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Desktop Profile */}
            <div className="hidden lg:block relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {userProfile.name || userProfile.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 font-medium capitalize">
                    {role?.toLowerCase() || "User"}
                  </p>
                </div>

                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                    {getInitial()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>

                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showProfileDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {userProfile.name || userProfile.fullName || "User"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {userProfile.email}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {role?.toLowerCase() || "user"}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200 group"
                    >
                      <svg
                        className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      My Profile
                    </Link>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="px-2">
                      <LogoutButton />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 relative"
              >
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showDropdown && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-50">
            <div className="px-4 py-4 space-y-2">
              {/* User Info */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {getInitial()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {userProfile.name || userProfile.fullName || "User"}
                  </p>
                  <p className="text-sm text-gray-600">{userProfile.email}</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {role?.toLowerCase() || "user"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                {links.map((item) => {
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setShowDropdown(false)}
                      className={`flex items-center px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      <span className="text-xl mr-3 transition-transform duration-200">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Profile Links */}
              <div className="border-t border-gray-200 pt-4 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center px-4 py-3.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center px-4 py-3.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 pt-4">
                <div className="px-2">
                  <LogoutButton
                    mobile={true}
                    onClose={() => setShowDropdown(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
