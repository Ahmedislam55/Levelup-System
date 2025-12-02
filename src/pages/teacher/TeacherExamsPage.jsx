import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function TeacherLevelsPage() {
  const [levels, setLevels] = useState([]);
  const [currentPageLevels, setCurrentPageLevels] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLevels, setExpandedLevels] = useState({});
  const navigate = useNavigate();

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const updateCurrentPageLevels = (levelsData, currentPage = page) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageLevels = levelsData.slice(startIndex, endIndex);
    setCurrentPageLevels(pageLevels);
  };

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await api.get("/teacher/exams");
      const result = res.data;

      if (result.success && result.data && Array.isArray(result.data)) {
        const levelsData = result.data;
        setLevels(levelsData);
        setTotal(levelsData.length);
        updateCurrentPageLevels(levelsData);

        if (levelsData.length > 0) {
          setExpandedLevels({ [levelsData[0].level._id]: true });
        }
      } else {
        throw new Error("Invalid data structure: expected result.data array");
      }
    } catch (err) {
      console.error("❌ Error loading levels:", err);
      setError("Failed to load levels: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLevels = useMemo(() => {
    if (!searchTerm) return levels;
    return levels.filter(
      (levelData) =>
        levelData.level?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        levelData.level?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        levelData.exams?.some(
          (exam) =>
            exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [levels, searchTerm]);

  useEffect(() => {
    if (filteredLevels.length > 0) {
      updateCurrentPageLevels(filteredLevels, page);
    } else {
      setCurrentPageLevels([]);
    }
  }, [page, filteredLevels]);

  useEffect(() => {
    fetchLevels();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const toggleLevel = (levelId) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }));
  };

  const getTotalExamsInLevel = (levelData) => {
    return levelData.exams?.length || 0;
  };

  const levelColors = [
    "from-blue-600 to-blue-700",
    "from-purple-600 to-purple-700",
    "from-emerald-600 to-emerald-700",
    "from-amber-600 to-amber-700",
    "from-rose-600 to-rose-700",
    "from-indigo-600 to-indigo-700",
  ];

  const getLevelColor = (index) => {
    return levelColors[index % levelColors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleExamClick = (examId, e) => {
    e.stopPropagation();
    navigate(`/teacher/exams/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Academic Levels
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Manage and monitor all educational levels and examinations
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 min-w-[160px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {total}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Total Levels
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Stats Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1 w-full max-w-2xl">
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
                    placeholder="Search levels, exams, descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredLevels.length}</span> of {total} levels
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {filteredLevels.reduce((total, level) => total + getTotalExamsInLevel(level), 0)}
                  </span> total exams
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Loading Academic Levels</p>
            <p className="text-gray-500 text-sm">Please wait while we fetch your levels and exams</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Unable to Load Levels</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchLevels}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              Try Again
            </button>
          </div>
        ) : currentPageLevels.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Levels Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? "No levels match your search criteria. Try adjusting your search terms." 
                : "There are no academic levels available at the moment."
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Levels Grid */}
            <div className="space-y-6 mb-8">
              {currentPageLevels.map((levelData, levelIndex) => (
                <div
                  key={levelData.level._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group"
                >
                  {/* Level Header */}
                  <div
                    className={`bg-gradient-to-r ${getLevelColor(levelIndex)} px-8 py-6 cursor-pointer transition-all duration-300 ${
                      expandedLevels[levelData.level._id] ? "rounded-t-2xl" : "rounded-2xl"
                    }`}
                    onClick={() => toggleLevel(levelData.level._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5 flex-1">
                        <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-2xl font-bold text-white tracking-tight">
                              {levelData.level.title || "Untitled Level"}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="bg-white bg-opacity-20 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm">
                                {getTotalExamsInLevel(levelData)} {getTotalExamsInLevel(levelData) === 1 ? 'Exam' : 'Exams'}
                              </span>
                              <span className="bg-white bg-opacity-10 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                Level {levelIndex + 1}
                              </span>
                            </div>
                          </div>
                          <p className="text-white text-opacity-90 text-base leading-relaxed">
                            {levelData.level.description || "No description available for this level"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-white text-opacity-90 text-sm font-medium">
                          {expandedLevels[levelData.level._id] ? 'Hide' : 'Show'} Details
                        </span>
                        <svg
                          className={`w-6 h-6 text-white transform transition-transform duration-300 ${
                            expandedLevels[levelData.level._id] ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Exams Section */}
                  {expandedLevels[levelData.level._id] && (
                    <div className="border-t border-gray-200 animate-fadeIn">
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Level Examinations</h4>
                            <p className="text-gray-600">Manage and review all exams in this level</p>
                          </div>
                          <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                            {getTotalExamsInLevel(levelData)} {getTotalExamsInLevel(levelData) === 1 ? 'Exam' : 'Exams'} Total
                          </span>
                        </div>

                        {/* Exams Grid */}
                        {levelData.exams && levelData.exams.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {levelData.exams.map((exam, examIndex) => (
                              <div
                                key={exam._id || examIndex}
                                onClick={(e) => handleExamClick(exam._id, e)}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-300 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                                        Exam #{examIndex + 1}
                                      </span>
                                    </div>
                                    <h5 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                      {exam.title || "Untitled Exam"}
                                    </h5>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                      {exam.description || "No description available for this examination"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                  <span className="flex items-center text-gray-500 text-sm">
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatDate(exam.startTime)}
                                  </span>
                                  <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors flex items-center text-sm">
                                    View Exam
                                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 font-semibold text-lg mb-2">No Exams Available</p>
                            <p className="text-gray-400 text-sm max-w-md mx-auto">
                              There are no examinations scheduled for this level yet. Check back later or contact administration.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredLevels.length)}</span> of <span className="font-semibold text-gray-900">{filteredLevels.length}</span> levels
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          disabled={loading}
                          className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 min-w-[44px] ${
                            pageNum === page
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
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
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}