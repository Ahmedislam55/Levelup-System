import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function ExamDetailsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      setError("");
      console.log(`📝 Fetching exam details for ID: ${examId}`);

      const res = await api.get(`/exam/${examId}`);
      const result = res.data;
      console.log("✅ Exam details loaded:", result);

      if (result.success && result.data && result.data.exam) {
        setExam(result.data.exam);
      } else {
        throw new Error("Invalid exam data structure");
      }
    } catch (err) {
      console.error("❌ Error loading exam details:", err);
      setError("Failed to load exam details");
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on search term
  const filteredQuestions = exam?.questions?.filter(question =>
    question.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  // Toggle question selection
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Select all questions on current page
  const selectAllOnPage = () => {
    const pageQuestionIds = currentQuestions.map(q => q._id);
    setSelectedQuestions(prev => {
      const newSelection = [...prev];
      pageQuestionIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Deselect all questions on current page
  const deselectAllOnPage = () => {
    const pageQuestionIds = currentQuestions.map(q => q._id);
    setSelectedQuestions(prev => prev.filter(id => !pageQuestionIds.includes(id)));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get question type based on content
  const getQuestionType = (questionText) => {
    if (questionText?.includes('+')) return 'addition';
    if (questionText?.includes('-')) return 'subtraction';
    if (questionText?.includes('*') || questionText?.includes('×')) return 'multiplication';
    if (questionText?.includes('/') || questionText?.includes('÷')) return 'division';
    return 'general';
  };

  // Get type color
  const getTypeColor = (type) => {
    const colors = {
      addition: 'bg-green-100 text-green-800 border-green-300',
      subtraction: 'bg-blue-100 text-blue-800 border-blue-300',
      multiplication: 'bg-purple-100 text-purple-800 border-purple-300',
      division: 'bg-orange-100 text-orange-800 border-orange-300',
      general: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[type] || colors.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading exam details...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Exam</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchExamDetails}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Exam Not Found</h3>
          <p className="text-gray-600 mb-6">The requested exam could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Levels
              </button>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                      {exam.title || "Untitled Exam"}
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                      {exam.description || "No description available"}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Starts: {formatDate(exam.startTime)}
                      </span>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {exam.questions?.length || 0} Questions
                      </span>
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
                        Group: {exam.group || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-center text-white">
                      <div className="text-3xl font-bold mb-1">
                        {exam.questions?.length || 0}
                      </div>
                      <div className="text-sm font-medium text-blue-100">
                        Total Questions
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredQuestions.length} of {exam.questions?.length || 0} questions
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllOnPage}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-xl hover:bg-green-200 transition-all duration-200"
                  >
                    Select Page
                  </button>
                  <button
                    onClick={deselectAllOnPage}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-xl hover:bg-red-200 transition-all duration-200"
                  >
                    Deselect Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="mb-8">
          {currentQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Questions Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "Try adjusting your search criteria" : "No questions available for this exam"}
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
            <div className="grid gap-6">
              {currentQuestions.map((question, index) => {
                const questionType = getQuestionType(question.questionText);
                const isSelected = selectedQuestions.includes(question._id);
                const globalIndex = filteredQuestions.findIndex(q => q._id === question._id);

                return (
                  <div
                    key={question._id}
                    className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'border-blue-500 ring-4 ring-blue-100' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                    }`}
                  >
                    <div className="p-6">
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                            Q{globalIndex + 1}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getTypeColor(questionType)}`}>
                            {questionType.charAt(0).toUpperCase() + questionType.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleQuestionSelection(question._id)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-500">
                            ID: {question._id?.slice(-6)}
                          </span>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          {question.questionText}
                        </h3>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {question.options?.map((option, optionIndex) => {
                          const isCorrect = option === question.correctAnswer;
                          const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                isCorrect
                                  ? 'bg-green-50 border-green-300 ring-2 ring-green-100'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                    isCorrect
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-300 text-gray-700'
                                  }`}>
                                    {optionLetter}
                                  </span>
                                  <span className={`font-medium ${
                                    isCorrect ? 'text-green-800' : 'text-gray-700'
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                                
                                {isCorrect && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                    Correct
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Correct Answer Highlight */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <span className="text-sm font-medium text-blue-800">Correct Answer:</span>
                            <span className="ml-2 text-lg font-bold text-blue-900">{question.correctAnswer}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstQuestion + 1} to {Math.min(indexOfLastQuestion, filteredQuestions.length)} of {filteredQuestions.length} questions
                <span className="ml-2 text-blue-600 font-medium">
                  (Page {currentPage} of {totalPages})
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                          pageNum === currentPage
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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
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
        )}

        {/* Selected Questions Summary */}
        {selectedQuestions.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-4 z-50">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700">
                {selectedQuestions.length} question(s) selected
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-xl hover:bg-blue-200 transition-all duration-200">
                  Export Selected
                </button>
                <button 
                  onClick={() => setSelectedQuestions([])}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}