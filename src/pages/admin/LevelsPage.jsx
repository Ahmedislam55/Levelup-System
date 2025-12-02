import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

function CreateLevelForm({ onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.post(`/admin/teachers_level`, {
        title: name,
        description,
      });

      const newLevel = res.data?.data || res.data;
      onCreated?.(newLevel);

      setSuccess("✅ Level created successfully!");
      setName("");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to create level");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-white font-semibold text-lg">Create New Level</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Level Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition duration-200"
              placeholder="Enter level name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition duration-200 resize-none"
              placeholder="Enter level description"
              rows={4}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-300 transform hover:-translate-y-0.5"
        >
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating Level...
            </div>
          ) : (
            "Create Level"
          )}
        </button>
      </form>
    </div>
  );
}

// Update Level Modal Component
function UpdateLevelModal({ level, isOpen, onClose, onUpdated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (level) {
      setName(level.title || level.name || "");
      setDescription(level.description || "");
    }
  }, [level]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.patch(`/level/${level.id || level._id}/update`, {
        title: name,
        description,
      });

      const updatedLevel = res.data?.data || res.data;
      onUpdated?.(updatedLevel, level.id || level._id);

      setSuccess("✅ Level updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to update level");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">Update Level</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Level Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="Enter level name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
              placeholder="Enter level description"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Level"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Level Details Modal Component
function LevelDetailsModal({ levelId, isOpen, onClose }) {
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLevelDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/level/${levelId}`);
      setLevelData(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "❌ Failed to load level details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && levelId) {
      fetchLevelDetails();
    }
  }, [isOpen, levelId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-xl mb-2">
                {levelData?.level?.title || "Level Details"}
              </h2>
              <p className="text-blue-100">
                {levelData?.level?.description || "No description available"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading level details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : levelData ? (
            <div className="space-y-6">
              {/* Level Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Level Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(levelData.level.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(levelData.level.updatedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-medium px-3 py-1 rounded-full text-sm ${
                          levelData.level.isDeleted
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {levelData.level.isDeleted ? "Deleted" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Teachers Count */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Teachers
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {levelData.level.teachers?.length || 0}
                    </div>
                    <p className="text-gray-600 font-medium">
                      Assigned Teachers
                    </p>
                  </div>
                </div>
              </div>

              {/* Teachers List */}
              {levelData.level.teachers &&
                levelData.level.teachers.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                      Assigned Teachers
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {levelData.level.teachers.map((teacher) => (
                        <div
                          key={teacher._id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {teacher.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Exams */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                  Exams
                </h3>
                {levelData.examsGrouped && levelData.examsGrouped.length > 0 ? (
                  <div className="space-y-4">
                    {levelData.examsGrouped.map((group, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            Group {group.group}
                          </h4>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {group.count} Exam{group.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {group.exams.map((exam, examIndex) => (
                            <div
                              key={exam._id}
                              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-semibold text-gray-900 text-md">
                                  {exam.title}
                                </h5>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                                  Active
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {exam.description}
                              </p>
                              <p className="text-xs text-gray-500 font-medium">
                                Start: {formatDate(exam.startTime)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-5xl mb-3">📝</div>
                    <p className="text-lg font-medium">
                      No exams available for this level
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LevelsPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedLevelForUpdate, setSelectedLevelForUpdate] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const loadLevels = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/level`);
      const raw = res.data;
      const data = raw?.data ?? raw;
      const parsed = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.levels)
        ? data.levels
        : [];
      setLevels(parsed);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to load levels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, []);

  const handleDelete = async (levelId) => {
    if (!window.confirm("Are you sure you want to delete this level?")) {
      return;
    }

    try {
      setDeletingId(levelId);
      await api.patch(`/level/${levelId}`);
      setLevels((prev) => prev.filter((l) => (l.id || l._id) !== levelId));
      alert("Level Deleted Successfully");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to delete level");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = (newLevel) => {
    if (newLevel) {
      setLevels((prev) => [newLevel, ...prev]);
    } else {
      loadLevels();
    }
  };

  const handleShowLevel = (levelId) => {
    setSelectedLevelId(levelId);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateLevel = (level) => {
    setSelectedLevelForUpdate(level);
    setIsUpdateModalOpen(true);
  };

  const handleUpdatedLevel = (updatedLevel, levelId) => {
    setLevels((prev) =>
      prev.map((level) =>
        (level.id || level._id) ===
        (levelId || updatedLevel.id || updatedLevel._id)
          ? { ...level, ...updatedLevel }
          : level
      )
    );
  };

  const handleCloseModals = () => {
    setIsDetailsModalOpen(false);
    setIsUpdateModalOpen(false);
    setSelectedLevelId(null);
    setSelectedLevelForUpdate(null);
  };
  const navigate = useNavigate();
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Levels Management
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create and manage educational levels with comprehensive controls and
            detailed overview
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Level Form */}
          <div className="lg:col-span-1">
            <CreateLevelForm onCreated={handleCreated} />
          </div>

          {/* Levels List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold text-lg">
                    All Levels
                  </h2>
                  <div className="text-blue-100 text-sm">
                    {levels.length} level{levels.length !== 1 ? "s" : ""} total
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4 text-lg">
                      Loading levels...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  </div>
                ) : levels.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-gray-500 text-lg font-medium">
                      No levels found
                    </p>
                    <p className="text-gray-400 mt-2">
                      Create your first level to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {levels.map((lvl) => (
                      <div
                        key={lvl.id || lvl._id}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                              {lvl.title || lvl.name}
                            </h3>
                            <p className="text-gray-600 line-clamp-2">
                              {lvl.description || "No description available"}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg ml-4">
                            {(lvl.title || lvl.name).charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              navigate(
                                `/upload-exam/level/${lvl.id || lvl._id}`
                              )
                            }
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Create Exam
                          </button>
                          <button
                            onClick={() => handleShowLevel(lvl.id || lvl._id)}
                            className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleUpdateLevel(lvl)}
                            className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lvl.id || lvl._id)}
                            disabled={deletingId === (lvl.id || lvl._id)}
                            className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                          >
                            {deletingId === (lvl.id || lvl._id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              <>
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Level Details Modal */}
        <LevelDetailsModal
          levelId={selectedLevelId}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModals}
        />

        {/* Update Level Modal */}
        <UpdateLevelModal
          level={selectedLevelForUpdate}
          isOpen={isUpdateModalOpen}
          onClose={handleCloseModals}
          onUpdated={handleUpdatedLevel}
        />
      </div>
    </section>
  );
}
