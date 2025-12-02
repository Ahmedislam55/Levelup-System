import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

export default function TeacherLevelsPage() {
  const [levels, setLevels] = useState([]);
  const [currentPageLevels, setCurrentPageLevels] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // تحديث المستويات المعروضة بناءً على الصفحة الحالية
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
      console.log("📚 Fetching teacher's levels...");

      try {
        const res = await api.get("/teacher/levels");
        const result = res.data;
        console.log("✅ Teacher's levels loaded:", result.data?.length || result.length, "levels");

        const levelsData = result.data || result || [];
        
        setLevels(levelsData);
        setTotal(levelsData.length);
        updateCurrentPageLevels(levelsData);
      } catch (apiError) {
        console.log("API not available, using empty data");
        setLevels([]);
        setTotal(0);
        updateCurrentPageLevels([]);
      }
    } catch (err) {
      console.error("❌ Error loading levels:", err);
      setError("Failed to load levels");
    } finally {
      setLoading(false);
    }
  };

  // Filter levels based on search term
  const filteredLevels = useMemo(() => {
    if (!searchTerm) return levels;
    return levels.filter(level =>
      level.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.grade?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [levels, searchTerm]);

  // عند تغيير الصفحة، نقوم بتحديث المستويات المعروضة
  useEffect(() => {
    if (filteredLevels.length > 0) {
      updateCurrentPageLevels(filteredLevels, page);
    } else {
      setCurrentPageLevels([]);
    }
  }, [page, filteredLevels]);

  // جلب البيانات عند التحميل الأولي
  useEffect(() => {
    fetchLevels();
  }, []);

  // ألوان متدرجة للمستويات
  const levelColors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-blue-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
  ];

  const getLevelColor = (index) => {
    return levelColors[index % levelColors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Academic Levels
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Manage and explore all educational levels and curricula under your supervision
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
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

        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search levels by title, description, or grade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Showing {filteredLevels.length} of {total} levels
              </div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading academic levels...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the information</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Levels</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchLevels}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : currentPageLevels.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Levels Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Try adjusting your search criteria" : "No academic levels available at the moment"}
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
        ) : (
          <>
            {/* Levels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
              {currentPageLevels.map((level, idx) => (
                <div
                  key={level.id || level._id || idx}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden"
                >
                  {/* Level Header with Gradient */}
                  <div className={`bg-gradient-to-r ${getLevelColor(idx)} px-6 py-8`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Level {(page - 1) * pageSize + idx + 1}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {level.title || "Untitled Level"}
                    </h3>
                    <p className="text-white text-opacity-90 text-sm">
                      {level.grade || "No grade specified"}
                    </p>
                  </div>

                  {/* Level Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {level.description || "No description available for this academic level."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, filteredLevels.length)} of {filteredLevels.length} levels
                  <span className="ml-2 text-blue-600 font-medium">
                    (Page {page} of {totalPages})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newPage = Math.max(1, page - 1);
                      setPage(newPage);
                    }}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum =
                        Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          disabled={loading}
                          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                            pageNum === page
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      const newPage = Math.min(totalPages, page + 1);
                      setPage(newPage);
                    }}
                    disabled={page === totalPages || loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}