import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function TeacherReportPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [expandedStudents, setExpandedStudents] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/teacher/students/report');
        
        if (response.data.success) {
          setReportData(response.data.data);
        } else {
          setError('Failed to fetch report data');
        }
      } catch (err) {
        setError('Error fetching report: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const toggleStudentExpansion = (studentId, event) => {
    event.stopPropagation(); // منع الانتقال عند النقر على زر التفاصيل
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleStudentClick = (studentId) => {
    navigate(`/teacher/report/${studentId}`);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeColor = (grade, totalQuestions) => {
    const percentage = (grade / (totalQuestions * 10)) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredStudents = reportData?.students.filter(student => {
    if (selectedLevel === 'all') return true;
    return student.levels.some(level => level.level.id === selectedLevel);
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Loading Student Reports</p>
          <p className="text-gray-500">Please wait while we gather the progress data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Report</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700">No report data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Progress Report</h1>
              <p className="text-gray-600 mt-2 text-lg">Comprehensive overview of student performance across all levels</p>
            </div>
          </div>
        </div>

        {/* Level Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Filter by Level</h2>
              <p className="text-sm text-gray-500">View students from specific levels</p>
            </div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="min-w-[200px] px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="all">All Levels</option>
              {reportData.levels.map(level => (
                <option key={level._id} value={level._id}>
                  {level.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Levels</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.levels.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Levels</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredStudents.reduce((total, student) => 
                    total + student.levels.filter(level => level.progress.completed).length, 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredStudents.length > 0 
                    ? Math.round(filteredStudents.reduce((total, student) => 
                        total + student.levels.reduce((sum, level) => sum + level.progress.percentage, 0) / student.levels.length, 0
                      ) / filteredStudents.length)
                    : 0
                  }%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Students ({filteredStudents.length})</h2>
            <p className="text-sm text-gray-600 mt-1">Click on any student to view detailed report</p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredStudents.map((studentData, index) => (
              <div 
                key={studentData.student.id} 
                className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
                onClick={() => handleStudentClick(studentData.student.id)}
              >
                {/* Student Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-200">
                      <span className="text-white font-bold text-lg">
                        {studentData.student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {studentData.student.name}
                      </h3>
                      <p className="text-gray-500">{studentData.student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => toggleStudentExpansion(studentData.student.id, e)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl font-medium"
                    >
                      <span>{expandedStudents[studentData.student.id] ? 'Hide' : 'Show'} Details</span>
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${
                          expandedStudents[studentData.student.id] ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="text-blue-600 font-semibold flex items-center">
                      View Full Report
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Student Levels */}
                <div className="space-y-4">
                  {studentData.levels.map((levelData, levelIndex) => (
                    <div key={levelData.level.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-semibold text-gray-900">{levelData.level.title}</h4>
                          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getProgressColor(levelData.progress.percentage)}`}>
                            {levelData.progress.percentage}% Complete
                          </span>
                        </div>
                        <div className={`font-semibold ${levelData.progress.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                          {levelData.progress.completed ? '✅ Completed' : '🔄 In Progress'}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${levelData.progress.percentage}%` }}
                        ></div>
                      </div>

                      {/* Progress Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-4">
                        <div className="text-center">
                          <p className="text-gray-500 font-medium">Current Exam</p>
                          <p className="font-bold text-gray-900 text-lg">{levelData.progress.currentExamOrder}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 font-medium">Exams Passed</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {levelData.progress.firstScoresCount}/{levelData.progress.totalExams}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 font-medium">Total Attempts</p>
                          <p className="font-bold text-gray-900 text-lg">{levelData.attempts.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 font-medium">Success Rate</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {levelData.attempts.length > 0 
                              ? Math.round((levelData.progress.firstScoresCount / levelData.attempts.length) * 100) 
                              : 0
                            }%
                          </p>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedStudents[studentData.student.id] && (
                        <div className="mt-6 space-y-6 animate-fadeIn">
                          {/* First Scores */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-4 text-lg">Best Scores</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {levelData.progress.firstScores.map((score, scoreIndex) => (
                                <div key={scoreIndex} className="bg-white rounded-xl p-4 border border-gray-300 shadow-sm">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-gray-900">Exam {scoreIndex + 1}</span>
                                    <span className={`font-bold text-lg ${getGradeColor(score.grade, score.totalQuestions)}`}>
                                      {score.correctCount}/{(score.totalQuestions)}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p className="flex justify-between">
                                      <span>Correct Answers:</span>
                                      <span className="font-semibold">{score.correctCount}/{score.totalQuestions}</span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span>Success Rate:</span>
                                      <span className="font-semibold">
                                        {Math.round((score.correctCount / score.totalQuestions) * 100)}%
                                      </span>
                                    </p>
                                    <p className="flex justify-between">
                                      <span>Submitted:</span>
                                      <span className="font-semibold">{new Date(score.submittedAt).toLocaleDateString()}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* All Attempts */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-4 text-lg">All Attempts ({levelData.attempts.length})</h5>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                              {levelData.attempts.map((attempt, attemptIndex) => (
                                <div key={attemptIndex} className="bg-white rounded-lg p-4 border border-gray-200 text-sm hover:border-blue-300 transition-colors">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-gray-900">{attempt.examTitle}</span>
                                    <span className={`font-bold ${getGradeColor(attempt.grade, attempt.totalQuestions || 1)}`}>
                                      {attempt.correctCount}/{(attempt.totalQuestions || 1) }
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-gray-600 mb-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">Attempt {attemptIndex + 1}</span>
                                    <span>{new Date(attempt.submittedAt).toLocaleString()}</span>
                                  </div>
                                  {attempt.correctCount !== undefined && (
                                    <div className="text-gray-600 flex justify-between">
                                      <span>Correct Answers:</span>
                                      <span className="font-semibold">{attempt.correctCount}/{attempt.totalQuestions}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-gray-500 text-xl font-semibold mb-2">No Students Found</p>
              <p className="text-gray-400">No students match the selected level filter</p>
            </div>
          )}
        </div>
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