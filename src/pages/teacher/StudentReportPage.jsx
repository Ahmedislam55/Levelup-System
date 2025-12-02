import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function StudentReportPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedLevels, setExpandedLevels] = useState({});

  useEffect(() => {
    const fetchStudentReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/teacher/students/${studentId}/report`);
        
        if (response.data.success) {
          setReportData(response.data.data);
        } else {
          setError('Failed to fetch student report');
        }
      } catch (err) {
        setError('Error fetching student report: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentReport();
    }
  }, [studentId]);

  const toggleLevelExpansion = (levelId) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
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

  const getStatusColor = (completed) => {
    return completed ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';
  };

  const calculateSuccessRate = (attempts, firstScoresCount) => {
    if (attempts.length === 0) return 0;
    return Math.round((firstScoresCount / attempts.length) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Loading Student Report</p>
          <p className="text-gray-500">Please wait while we gather the student's progress data</p>
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
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold mr-4"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold"
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
          <p className="text-lg text-gray-700">No student data available</p>
        </div>
      </div>
    );
  }

  const { student, levels } = reportData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Report Logo Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Report Logo */}
            <div className="relative">
              <div className="w-16 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg flex items-center justify-center transform rotate-6">
                {/* Document Shape */}
                <div className="w-12 h-16 bg-white rounded-lg relative overflow-hidden">
                  {/* Document Lines */}
                  <div className="absolute top-3 left-2 right-2 h-1 bg-blue-200 rounded"></div>
                  <div className="absolute top-5 left-2 right-4 h-1 bg-blue-200 rounded"></div>
                  <div className="absolute top-7 left-2 right-6 h-1 bg-blue-200 rounded"></div>
                  <div className="absolute top-9 left-2 right-3 h-1 bg-blue-200 rounded"></div>
                  <div className="absolute top-11 left-2 right-5 h-1 bg-blue-200 rounded"></div>
                  
                  {/* Chart Bars */}
                  <div className="absolute bottom-2 left-3 w-1 h-3 bg-green-400 rounded-t"></div>
                  <div className="absolute bottom-2 left-5 w-1 h-5 bg-blue-400 rounded-t"></div>
                  <div className="absolute bottom-2 left-7 w-1 h-4 bg-yellow-400 rounded-t"></div>
                  <div className="absolute bottom-2 left-9 w-1 h-6 bg-purple-400 rounded-t"></div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full opacity-80"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-500 rounded-full opacity-80"></div>
            </div>
            
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Academic Report
              </h1>
              <p className="text-gray-600 text-lg mt-1">Detailed Student Performance Analysis</p>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Students Report
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h1>
                  <p className="text-gray-600 text-lg">{student.email}</p>
                  <p className="text-gray-500 mt-1">Student ID: {student.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {levels.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Levels</div>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {levels.filter(level => level.progress.completed).length}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(levels.reduce((total, level) => total + level.progress.percentage, 0) / levels.length)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams Taken</p>
                <p className="text-2xl font-bold text-gray-900">
                  {levels.reduce((total, level) => total + level.attempts.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {levels.length > 0 
                    ? Math.round(levels.reduce((total, level) => 
                        total + calculateSuccessRate(level.attempts, level.progress.firstScoresCount), 0) / levels.length)
                    : 0
                  }%
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
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {levels.length > 0
                    ? Math.round(levels.reduce((total, level) => {
                        const levelTotal = level.progress.firstScores.reduce((sum, score) => sum + score.grade, 0);
                        return total + (levelTotal / level.progress.firstScores.length);
                      }, 0) / levels.length)
                    : 0
                  }/100
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Levels Progress */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Progress</h2>
          
          {levels.map((levelData, index) => (
            <div key={levelData.level.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Level Header */}
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6 cursor-pointer transition-all duration-300"
                onClick={() => toggleLevelExpansion(levelData.level.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{levelData.level.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {levelData.progress.percentage}% Complete
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(levelData.progress.completed)}`}>
                          {levelData.progress.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-medium">
                      {expandedLevels[levelData.level.id] ? 'Hide' : 'Show'} Details
                    </span>
                    <svg 
                      className={`w-5 h-5 text-white transform transition-transform duration-300 ${
                        expandedLevels[levelData.level.id] ? 'rotate-180' : ''
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

              {/* Level Details */}
              {expandedLevels[levelData.level.id] && (
                <div className="p-6 border-t border-gray-200 animate-fadeIn">
                  {/* Progress Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {levelData.progress.currentExamOrder}
                      </div>
                      <div className="text-sm text-gray-600">Current Exam</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {levelData.progress.firstScoresCount}/{levelData.progress.totalExams}
                      </div>
                      <div className="text-sm text-gray-600">Exams Passed</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {levelData.attempts.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Attempts</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {calculateSuccessRate(levelData.attempts, levelData.progress.firstScoresCount)}%
                      </div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-700">{levelData.progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${levelData.progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Best Scores */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Best Scores</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {levelData.progress.firstScores.map((score, scoreIndex) => (
                        <div key={scoreIndex} className="bg-white border border-gray-300 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold text-gray-900">Exam {scoreIndex + 1}</h5>
                              <p className="text-sm text-gray-600">Best Attempt</p>
                            </div>
                            <span className={`text-xl font-bold ${getGradeColor(score.grade, score.totalQuestions)}`}>
                              {score.correctCount}/{(score.totalQuestions)}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Correct Answers:</span>
                              <span className="font-semibold">{score.correctCount}/{score.totalQuestions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Success Rate:</span>
                              <span className="font-semibold text-green-600">
                                {Math.round((score.correctCount / score.totalQuestions) * 100)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Submitted:</span>
                              <span className="font-semibold">{formatDate(score.submittedAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Attempts */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      All Attempts ({levelData.attempts.length})
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {levelData.attempts.map((attempt, attemptIndex) => (
                        <div key={attemptIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-300 hover:border-blue-300 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-semibold text-gray-900">{attempt.examTitle}</h5>
                              <p className="text-sm text-gray-600">Exam Order: {attempt.examOrder}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-lg font-bold ${getGradeColor(attempt.grade, attempt.totalQuestions)}`}>
                                {attempt.correctCount}/{(attempt.totalQuestions)}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">Attempt {attemptIndex + 1}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Correct Answers:</span>{' '}
                              {attempt.correctCount}/{attempt.totalQuestions}
                            </div>
                            <div>
                              <span className="font-medium">Success Rate:</span>{' '}
                              {Math.round((attempt.correctCount / attempt.totalQuestions) * 100)}%
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Submitted:</span>{' '}
                              {formatDate(attempt.submittedAt)}
                            </div>
                          </div>
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