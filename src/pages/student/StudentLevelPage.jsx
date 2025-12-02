import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function StudentLevelsPage() {
  const navigate = useNavigate();
  const [levelData, setLevelData] = useState(null);
  const [currentPageExams, setCurrentPageExams] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const handleExamClick = (examId) => {
    if (!examId) return;
    
    console.log("🎯 Opening exam with ID:", examId);
    navigate(`/student/levels/exams/${examId}`);
  };

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📚 Fetching student level data...");

      const res = await api.get("/student/level");
      const result = res.data;
      console.log("✅ Student level data loaded:", result);

      if (result.success && result.data) {
        setLevelData(result.data);

        const allExams =
          result.data.examsGrouped?.flatMap((group) => group.exams) || [];
        setCurrentPageExams(allExams.slice(0, pageSize));
      } else {
        setError("No level data available");
      }
    } catch (err) {
      console.error("❌ Error loading level data:", err);
      setError("Failed to load level data");
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = useMemo(() => {
    if (!levelData?.examsGrouped) return [];

    let exams = [];

    if (selectedGroup === "all") {
      exams = levelData.examsGrouped.flatMap((group) =>
        group.exams.map((exam) => ({ 
          ...exam, 
          group: group.group,
          examId: exam._id || exam.id 
        }))
      );
    } else {
      const group = levelData.examsGrouped.find(
        (g) => g.group === selectedGroup
      );
      exams = group
        ? group.exams.map((exam) => ({ 
            ...exam, 
            group: group.group,
            examId: exam._id || exam.id 
          }))
        : [];
    }

    if (searchTerm) {
      exams = exams.filter(
        (exam) =>
          exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.group?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return exams;
  }, [levelData, searchTerm, selectedGroup]);

  useEffect(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageExams = filteredExams.slice(startIndex, endIndex);
    setCurrentPageExams(pageExams);
  }, [page, filteredExams, pageSize]);

  useEffect(() => {
    fetchLevelData();
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));

  const cardColors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-blue-500",
  ];

  const getCardColor = (index) => {
    return cardColors[index % cardColors.length];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExamStatus = (exam, index) => {
    const progress = levelData?.studentProgress;
    if (!progress) return "upcoming";

    const examOrder = parseInt(exam.title?.split("-")[0]) || index + 1;

    if (examOrder < progress.currentExamOrder) return "completed";
    if (examOrder === progress.currentExamOrder) return "current";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                My Academic Level
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Track your progress and access your exams in{" "}
                {levelData?.level?.title || "your current level"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {levelData?.level && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {levelData.level.title}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      Current Level
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {levelData?.studentProgress && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Your Progress
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Overall Progress</span>
                        <span>{levelData.studentProgress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${levelData.studentProgress.percentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {levelData.studentProgress.currentExamOrder}
                      </div>
                      <div className="text-sm text-gray-600">Current Exam</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {levelData.studentProgress.firstScoresCount}
                      </div>
                      <div className="text-sm text-gray-600">First Scores</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {levelData.studentProgress.totalExams}
                      </div>
                      <div className="text-sm text-gray-600">Total Exams</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3">
                      <div className="text-2xl font-bold text-orange-600">
                        {levelData.studentProgress.completed
                          ? "Completed"
                          : "In Progress"}
                      </div>
                      <div className="text-sm text-gray-600">Status</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                {/* Group Filter */}
                <div className="w-full sm:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Group
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Groups</option>
                    {levelData?.examsGrouped?.map((group) => (
                      <option key={group.group} value={group.group}>
                        Group {group.group} ({group.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Exams
                  </label>
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
                      placeholder="Search exams by title, description, or group..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Showing {filteredExams.length} exams
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">
              Loading your exams...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please wait while we fetch your information
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Error Loading Data
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchLevelData}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : currentPageExams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Exams Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedGroup !== "all"
                ? "Try adjusting your search criteria"
                : "No exams available for your current level"}
            </p>
            {(searchTerm || selectedGroup !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGroup("all");
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
              {currentPageExams.map((exam, idx) => {
                const status = getExamStatus(exam, idx);
                const statusColors = {
                  completed: "from-green-500 to-emerald-500",
                  current: "from-blue-500 to-cyan-500",
                  upcoming: "from-gray-400 to-gray-500",
                };
                const statusText = {
                  completed: "Completed",
                  current: "Current",
                  upcoming: "Upcoming",
                };

                return (
                  <div
                    key={exam.examId || exam._id || idx}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden cursor-pointer"
                    onClick={() => handleExamClick(exam.examId || exam._id)}
                  >
                    {/* Exam Header with Gradient */}
                    <div
                      className={`bg-gradient-to-r ${statusColors[status]} px-6 py-6`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Group {exam.group}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {exam.title || "Untitled Exam"}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {statusText[status]}
                        </span>
                      </div>
                    </div>

                    {/* Exam Content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {exam.description ||
                          "No description available for this exam."}
                      </p>

                      {exam.startTime && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Starts: {formatDate(exam.startTime)}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleExamClick(exam.examId || exam._id);
                        }}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                          status === "current"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                            : status === "completed"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={status === "upcoming"}
                      >
                        {status === "completed"
                          ? "Return Exam"
                          : status === "current"
                          ? "Start Exam"
                          : "Coming Soon"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, filteredExams.length)} of{" "}
                    {filteredExams.length} exams
                    <span className="ml-2 text-blue-600 font-medium">
                      (Page {page} of {totalPages})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
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
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum =
                            Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                          if (pageNum > totalPages) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                pageNum === page
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
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
            )}
          </>
        )}
      </div>
    </div>
  );
}