import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

export default function StudentPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPageUsers, setCurrentPageUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  // Update modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateForm, setUpdateForm] = useState({ name: "", email: "" });
  const [updateUserId, setUpdateUserId] = useState("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setPage(1); // Reset to first page when searching
  }, [searchTerm, allUsers]);

  // Update current page users
  const updateCurrentPageUsers = (users, currentPage = page) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageUsers = users.slice(startIndex, endIndex);
    setCurrentPageUsers(pageUsers);
    setTotal(users.length);
  };

  // Modal handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      const res = await api.post("/auth/signup", payload);
      console.log("/auth/signup response:", res?.data);
      const root = res?.data || {};
      const created = root.data || root.user || root;

      const normalized = {
        id: created.id || created._id,
        name: created.name || payload.name,
        email: created.email || payload.email,
        role: created.role || payload.role,
        isActive: false,
      };
      
      const updatedUsers = [normalized, ...allUsers];
      setAllUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      setModalMessage("Student created successfully 🎉");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
      });

      setTimeout(() => {
        setShowModal(false);
        setModalMessage("");
      }, 1200);

      await fetchUsers();
    } catch (error) {
      console.error("Create student error:", error?.response?.data || error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        "Failed to create student ❌";
      setModalMessage(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMessage("");
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
    });
  };

  const handleOpenUpdateModal = (user) => {
    setUpdateUserId(user.id || user._id || "");
    setUpdateForm({
      name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.email || "",
    });
    setUpdateMessage("");
    setShowUpdateModal(true);
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!updateUserId) return;
    try {
      setUpdateLoading(true);
      setUpdateMessage("");
      const res = await api.patch("/auth/update-profile", {
        userId: updateUserId,
        name: updateForm.name,
        email: updateForm.email,
      });
      const updatedFromApi = res?.data?.data || res?.data || {};
      const updatedName = updatedFromApi.name || updateForm.name;
      const updatedEmail = updatedFromApi.email || updateForm.email;

      setAllUsers((prev) => {
        const next = prev.map((u) => {
          const uid = u.id || u._id;
          if (uid === updateUserId) {
            return { ...u, name: updatedName, email: updatedEmail };
          }
          return u;
        });
        updateCurrentPageUsers(next, page);
        return next;
      });

      setUpdateForm({ name: updatedName, email: updatedEmail });
      setUpdateMessage("Student updated successfully 🎉");

      fetchUsers();

      setTimeout(() => {
        setShowUpdateModal(false);
        setUpdateMessage("");
      }, 1200);
    } catch (err) {
      console.error("Update student error:", err);
      setUpdateMessage(
        err.response?.data?.message || "Failed to update student ❌"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // Toggle student status function
  const handleToggleStudentStatus = async (studentId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus;

      const payload = {
        isActive: newStatus.toString(),
      };

      const response = await api.patch(`/admin/student/${studentId}`, payload);
      console.log(`Student ${newStatus ? "activated" : "deactivated"} successfully:`, response.data);

      await fetchUsers();

      setModalMessage(
        `Student ${newStatus ? "activated" : "deactivated"} successfully! 🎉`
      );
      setTimeout(() => {
        setModalMessage("");
      }, 3000);
    } catch (error) {
      console.error("❌ Error toggling student status:", error);
      setModalMessage("Failed to update student status ❌");
      setTimeout(() => {
        setModalMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Delete student function
  const handleDeleteStudent = async (studentId) => {
    try {
      setLoading(true);
      console.log(`🗑️ Deleting student with ID: ${studentId}`);

      const response = await api.patch(`/auth/${studentId}/delete-profile`, {
        userId: studentId,
      });

      console.log("✅ Student deleted successfully:", response.data);
      setModalMessage("Student deleted successfully ✅");

      setAllUsers((prevUsers) =>
        prevUsers.filter((user) => (user.id || user._id) !== studentId)
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.filter((user) => (user.id || user._id) !== studentId)
      );
      setTotal((prev) => prev - 1);
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      setModalMessage("Error occurred while deleting ❌");
    } finally {
      setLoading(false);
      setTimeout(() => setModalMessage(""), 3000);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📄 Fetching all students...");

      try {
        const res = await api.get(`/admin/users?role=STUDENT`);
        const result = res.data;
        console.log("✅ Students loaded:", result.data?.length, "students");

        setAllUsers(result.data || []);
        setFilteredUsers(result.data || []);
      } catch (apiError) {
        console.log("API not available, using empty data");
        setAllUsers([]);
        setFilteredUsers([]);
      }
    } catch (err) {
      console.error("❌ Error loading students:", err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // Update current page when page or filtered users change
  useEffect(() => {
    updateCurrentPageUsers(filteredUsers, page);
  }, [page, filteredUsers]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Students Management
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Manage all students in the system with comprehensive controls and search functionality
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 min-w-[140px]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {total}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Total Students
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Student
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span>{filteredUsers.length} students found</span>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <h2 className="text-white font-semibold text-lg mb-2 sm:mb-0">Students List</h2>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <span>Page {page} of {totalPages}</span>
                <span className="text-blue-200">•</span>
                <span>Showing {currentPageUsers.length} students</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={5}>
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-gray-500">Loading students...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={5}>
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-red-600 font-medium">{error}</span>
                        <button
                          onClick={fetchUsers}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : currentPageUsers.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={5}>
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <span className="text-gray-500">
                          {searchTerm ? "No students match your search" : "No students found"}
                        </span>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPageUsers.map((u, idx) => (
                    <tr
                      key={u.id || u._id || idx}
                      className="hover:bg-blue-50 transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {(u.name || `${u.firstName || ""} ${u.lastName || ""}`)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {u.name || `${u.firstName || ""} ${u.lastName || ""}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {u.id || u._id || `#${(page - 1) * pageSize + idx + 1}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          {u.role || "STUDENT"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleToggleStudentStatus(
                              u.id || u._id,
                              u.isActive !== false
                            )
                          }
                          disabled={loading}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 ${
                            u.isActive !== false
                              ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200 border border-red-200"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              u.isActive !== false
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          {u.isActive !== false ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenUpdateModal(u)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 transform hover:scale-105"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(u.id || u._id)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 transform hover:scale-105"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{(page - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min(page * pageSize, total)}</span> of{" "}
                  <span className="font-semibold">{total}</span> students
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          disabled={loading}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[40px] ${
                            pageNum === page
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                  >
                    Next
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Add New Student</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter password"
                />
              </div>

              {modalMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  modalMessage.includes("successfully") || modalMessage.includes("🎉")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {modalMessage}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 font-medium flex items-center justify-center"
                >
                  {modalLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Student"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Student Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Update Student</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmitUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={updateForm.name}
                  onChange={handleUpdateInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={updateForm.email}
                  onChange={handleUpdateInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter email address"
                />
              </div>
              {updateMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  updateMessage.includes("successfully") || updateMessage.includes("🎉")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {updateMessage}
                </div>
              )}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 font-medium flex items-center justify-center"
                >
                  {updateLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Student"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}