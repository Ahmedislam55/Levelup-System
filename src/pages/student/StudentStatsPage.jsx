import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function StudentStatsPage() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // جلب بيانات الإحصائيات
  const fetchStatsData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log("📊 Fetching student statistics...");

      const res = await api.get("/student/levels/stats");
      const result = res.data;
      console.log("✅ Student statistics loaded:", result);

      if (result.success && result.data) {
        setStatsData(result.data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      console.error("❌ Error loading statistics:", err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات عند التحميل الأولي
  useEffect(() => {
    fetchStatsData();
  }, []);

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // حساب النسبة الصحيحة بناءً على correctCount و totalQuestions
  const calculateCorrectPercentage = (score) => {
    if (!score.totalQuestions || score.totalQuestions === 0) return 0;
    return Math.round((score.correctCount / score.totalQuestions) * 100);
  };

  // حساب المتوسط بناءً على النسبة الصحيحة
  const calculateAverage = () => {
    if (!statsData?.firstScores?.length) return 0;
    const total = statsData.firstScores.reduce((sum, score) => sum + calculateCorrectPercentage(score), 0);
    return (total / statsData.firstScores.length).toFixed(1);
  };

  // أعلى درجة بناءً على النسبة الصحيحة
  const getHighestScore = () => {
    if (!statsData?.firstScores?.length) return 0;
    return Math.max(...statsData.firstScores.map(score => calculateCorrectPercentage(score)));
  };

  // أدنى درجة بناءً على النسبة الصحيحة
  const getLowestScore = () => {
    if (!statsData?.firstScores?.length) return 0;
    return Math.min(...statsData.firstScores.map(score => calculateCorrectPercentage(score)));
  };

  // نسبة النجاح بناءً على النسبة الصحيحة
  const getSuccessRate = () => {
    if (!statsData?.firstScores?.length) return 0;
    const passed = statsData.firstScores.filter(score => calculateCorrectPercentage(score) >= 50).length;
    return ((passed / statsData.firstScores.length) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading your statistics...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your progress data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Statistics</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchStatsData}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                My Progress Statistics
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Track your academic performance and exam results
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Time Range Filter */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              <button
                onClick={() => navigate('/student/levels')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
              >
                Back to Levels
              </button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Overall Progress Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Progress</h3>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {statsData.percentage}%
                </div>
                <div className="text-sm text-gray-500">Completion Rate</div>
              </div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                statsData.completed ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <svg className={`w-10 h-10 ${statsData.completed ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{statsData.currentExamOrder}</div>
                <div className="text-sm text-gray-600">Current Exam</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{statsData.firstScoresCount}</div>
                <div className="text-sm text-gray-600">Exams Taken</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{statsData.totalExams}</div>
                <div className="text-sm text-gray-600">Total Exams</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {statsData.completed ? 'Completed' : 'In Progress'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
            
            <div className="space-y-6">
              {/* Average Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Average Score</span>
                  <span className="text-2xl font-bold text-blue-600">{calculateAverage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${calculateAverage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Highest Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Highest Score</span>
                  <span className="text-2xl font-bold text-green-600">{getHighestScore()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getHighestScore()}%` }}
                  ></div>
                </div>
              </div>

              {/* Lowest Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Lowest Score</span>
                  <span className="text-2xl font-bold text-orange-600">{getLowestScore()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getLowestScore()}%` }}
                  ></div>
                </div>
              </div>

              {/* Success Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Success Rate</span>
                  <span className="text-2xl font-bold text-purple-600">{getSuccessRate()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getSuccessRate()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Results */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Exam Results</h3>
            <div className="text-sm text-gray-500 mt-2 lg:mt-0">
              Showing {statsData.firstScores?.length || 0} exam results
            </div>
          </div>

          {statsData.firstScores && statsData.firstScores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statsData.firstScores.map((score, index) => {
                const correctPercentage = calculateCorrectPercentage(score);
                const passed = correctPercentage >= 50;
                
                return (
                  <div
                    key={score.exam || index}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        passed ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <svg className={`w-6 h-6 ${passed ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        passed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {correctPercentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Score ({score.correctCount}/{score.totalQuestions})
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{score.correctCount}</div>
                        <div className="text-xs text-gray-500">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-600">{score.totalQuestions}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        Submitted on
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        {formatDate(score.submittedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Exam Results Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't taken any exams yet. Start your first exam to see your results here.
              </p>
              <button
                onClick={() => navigate('/student/levels')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
              >
                Take an Exam
              </button>
            </div>
          )}
        </div>

        {/* Progress Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Over Time</h3>
          
          {statsData.firstScores && statsData.firstScores.length > 0 ? (
            <div className="relative h-64">
              {/* Simple Bar Chart */}
              <div className="flex items-end justify-between h-48 gap-2">
                {statsData.firstScores.map((score, index) => {
                  const correctPercentage = calculateCorrectPercentage(score);
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className={`w-full max-w-16 rounded-t-lg transition-all duration-500 ${
                          correctPercentage >= 50 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${correctPercentage}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">Exam {index + 1}</div>
                      <div className="text-sm font-semibold text-gray-700">{correctPercentage}%</div>
                    </div>
                  );
                })}
              </div>
              
              {/* Chart Legend */}
              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Passed (≥50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Failed (&lt;50%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-600">No data available for progress chart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}