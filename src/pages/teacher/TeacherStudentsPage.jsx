import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function TeacherStudentDetailsPage() {
  const [allStudents, setAllStudents] = useState([]);
  const [currentPageStudents, setCurrentPageStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const updateCurrentPageStudents = (students, currentPage = page) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageStudents = students.slice(startIndex, endIndex);
    setCurrentPageStudents(pageStudents);
  };

  const handleStudentClick = (studentId) => {
    navigate(`/teacher/report/${studentId}`);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/teacher/students");
      const result = res.data;

      const studentsData = result.data || result || [];
      setAllStudents(studentsData);
      setTotal(studentsData.length);
      updateCurrentPageStudents(studentsData);
    } catch (err) {
      console.error("❌ Error loading students:", err);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents;
    return allStudents.filter(
      (student) =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allStudents, searchTerm]);

  useEffect(() => {
    if (filteredStudents.length > 0) {
      updateCurrentPageStudents(filteredStudents, page);
    } else {
      setCurrentPageStudents([]);
    }
  }, [page, filteredStudents]);

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Student Management
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Manage and monitor all students under your supervision with comprehensive analytics
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {total}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Total Students
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <svg 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search students by name, email, or grade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Showing {filteredStudents.length} of {total} students
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg 
                  className="w-6 h-6 mr-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
                  />
                </svg>
                Students List
              </h2>
              <div className="text-white text-opacity-90">
                {currentPageStudents.length} students displayed
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td className="px-8 py-16 text-center" colSpan={4}>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        <div>
                          <p className="text-lg font-medium text-gray-700">Loading students...</p>
                          <p className="text-sm text-gray-500">Please wait while we fetch the information</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-8 py-16 text-center" colSpan={4}>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                          <svg 
                            className="w-8 h-8 text-red-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Students</h3>
                          <p className="text-gray-600 mb-4">{error}</p>
                          <button
                            onClick={fetchStudents}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : currentPageStudents.length === 0 ? (
                  <tr>
                    <td className="px-8 py-16 text-center" colSpan={4}>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg 
                            className="w-8 h-8 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
                          <p className="text-gray-600 mb-4">
                            {searchTerm 
                              ? "No students match your search criteria" 
                              : "No students available at the moment"
                            }
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPageStudents.map((student, idx) => (
                    <tr 
                      key={student.id || student._id || idx}
                      className="hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {student.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              student.isActive !== false ? "bg-emerald-500" : "bg-red-500"
                            }`}></div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {student.name || "Not specified"}
                            </div>
                            <div className="text-sm text-gray-500">Student ID: {(page - 1) * pageSize + idx + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{student.email}</div>
                          {student.grade && (
                            <div className="text-sm text-gray-500">Grade: {student.grade}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                          student.isActive !== false
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            student.isActive !== false ? "bg-emerald-500" : "bg-red-500"
                          }`}></div>
                          {student.isActive !== false ? "Active" : "Inactive"}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button
                          onClick={() => handleStudentClick(student.id || student._id)}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-lg group/btn"
                        >
                          <svg 
                            className="w-4 h-4 mr-2 transform group-hover/btn:scale-110 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                            />
                          </svg>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{(page - 1) * pageSize + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(page * pageSize, filteredStudents.length)}</span> of{" "}
                <span className="font-semibold">{filteredStudents.length}</span> students
                <span className="ml-3 text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                  Page {page} of {totalPages}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-sm"
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 19l-7-7 7-7" 
                    />
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
                        className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                          pageNum === page
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"
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
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-sm"
                >
                  Next
                  <svg 
                    className="w-4 h-4 ml-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}