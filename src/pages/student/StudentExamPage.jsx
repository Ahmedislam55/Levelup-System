import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function StudentExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // جلب بيانات الامتحان
  const fetchExamData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log(`📝 Fetching exam data for ID: ${examId}`);

      const res = await api.get(`/student/levels/exams/${examId}`);
      const result = res.data;
      console.log("✅ Exam data loaded:", result);

      if (result.success && result.data) {
        setExamData(result.data);
        // إذا كان هناك وقت محدد في الامتحان، نستخدمه، وإلا نستخدم وقت افتراضي
        if (result.data.exam?.duration) {
          setTimeLeft(result.data.exam.duration * 60); // تحويل الدقائق إلى ثواني
        } else {
          // وقت افتراضي: 30 دقيقة للامتحان
          setTimeLeft(30 * 60);
        }
      } else {
        setError('Failed to load exam data');
      }
    } catch (err) {
      console.error("❌ Error loading exam data:", err);
      setError('Failed to load exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // بدء الامتحان
  const startExam = () => {
    setExamStarted(true);
    setExamResult(null);
  };

  // إعادة بدء الامتحان
  const restartExam = () => {
    setAnswers({});
    setCurrentQuestion(0);
    if (examData?.exam?.duration) {
      setTimeLeft(examData.exam.duration * 60);
    } else {
      setTimeLeft(30 * 60);
    }
    setExamStarted(true);
    setExamFinished(false);
    setExamResult(null);
  };

  // التعامل مع إجابة السؤال
  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // الانتقال للسؤال التالي
  const nextQuestion = () => {
    if (currentQuestion < examData.exam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  // الانتقال للسؤال السابق
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // الانتقال لسؤال محدد
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  // تقديم الامتحان
  const submitExam = async () => {
    try {
      setSubmitting(true);
      
      // تحويل الإجابات من object إلى array حسب تنسيق الـ API
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: questionId,
        answer: answer
      }));

      const submissionData = {
        answers: answersArray
      };

      console.log("📤 Submitting exam:", submissionData);
      
      // إرسال الإجابات للخادم
      const res = await api.post(`/student/levels/exams/${examId}/submit`, submissionData);
      console.log("📥 Submission response:", res.data);
      
      if (res.data.success) {
        console.log("✅ Exam submitted successfully", res.data);
        
        // معالجة البيانات المرجعة من الـ API بشكل صحيح
        const resultData = res.data.data;
        
        // حساب النتيجة بناءً على الإجابات الصحيحة
        const totalQuestions = examData?.exam?.questions?.length || 0;
        let correctCount = 0;

        // حساب عدد الإجابات الصحيحة
        examData.exam.questions.forEach(question => {
          const userAnswer = answers[question._id];
          const correctAnswer = question.correctAnswer;
          if (userAnswer === correctAnswer) {
            correctCount++;
          }
        });

        // حساب النسبة المئوية (100% بدلاً من 20%)
        const grade = Math.round((correctCount / totalQuestions) * 100);
        const passed = grade >= 60;

        console.log(`📊 Calculated results: ${correctCount}/${totalQuestions} = ${grade}%`);
        
        // إنشاء كائن النتيجة مع البيانات المحسوبة
        const examResultData = {
          grade: grade, // دائماً 100% إذا كانت جميع الإجابات صحيحة
          passed: passed,
          correctCount: correctCount,
          totalQuestions: totalQuestions,
          progress: resultData.progress || {
            percentage: grade,
            currentExamOrder: examData?.exam?.order || 1,
            completed: passed
          }
        };

        console.log("🎯 Final exam result:", examResultData);
        
        // حفظ نتيجة الامتحان وعرضها
        setExamResult(examResultData);
        setExamFinished(true);
        
      } else {
        setError(res.data.message || 'Failed to submit exam');
      }
    } catch (err) {
      console.error("❌ Error submitting exam:", err);
      
      // في حالة الخطأ، حساب النتيجة محلياً
      const totalQuestions = examData?.exam?.questions?.length || 0;
      let correctCount = 0;

      examData.exam.questions.forEach(question => {
        const userAnswer = answers[question._id];
        const correctAnswer = question.correctAnswer;
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      });

      const grade = Math.round((correctCount / totalQuestions) * 100);
      const passed = grade >= 60;

      console.log(`📊 Local fallback results: ${correctCount}/${totalQuestions} = ${grade}%`);
      
      const examResultData = {
        grade: grade,
        passed: passed,
        correctCount: correctCount,
        totalQuestions: totalQuestions,
        progress: {
          percentage: grade,
          currentExamOrder: examData?.exam?.order || 1,
          completed: passed
        }
      };

      setExamResult(examResultData);
      setExamFinished(true);
      
    } finally {
      setSubmitting(false);
    }
  };

  // عداد الوقت
  useEffect(() => {
    if (!examStarted || examFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // انتهاء الوقت تلقائياً
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examFinished, timeLeft]);

  // جلب البيانات عند التحميل
  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  // تنسيق الوقت
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // حساب عدد الأسئلة المجابة
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = examData?.exam?.questions?.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading exam...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your exam</p>
        </div>
      </div>
    );
  }

  if (error && !examFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Exam</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchExamData}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (examFinished && examResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full mx-4">
          {/* Result Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              examResult.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`w-10 h-10 ${examResult.passed ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {examResult.passed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {examResult.passed ? 'Congratulations!' : 'Exam Completed'}
            </h2>
            <p className="text-xl text-gray-600">
              {examResult.passed ? 'You passed the exam!' : 'Keep practicing to improve your score'}
            </p>
          </div>

          {/* Exam Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Score Card */}
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Score</h3>
              <div className={`text-4xl font-bold mb-2 ${
                examResult.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {examResult.grade}%
              </div>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                examResult.passed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {examResult.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>

            {/* Questions Card */}
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Questions</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {examResult.correctCount}/{examResult.totalQuestions}
              </div>
              <p className="text-green-700">Correct Answers</p>
            </div>
          </div>

          {/* Progress Update */}
          <div className="bg-purple-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Level Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Progress:</span>
                <span className="text-xl font-bold text-purple-600">{examResult.progress.percentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next Exam:</span>
                <span className="font-semibold text-gray-900">#{examResult.progress.currentExamOrder}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Level Status:</span>
                <span className={`font-semibold ${examResult.progress.completed ? 'text-green-600' : 'text-blue-600'}`}>
                  {examResult.progress.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={restartExam}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Exam
            </button>
            
            <button
              onClick={() => navigate('/student/levels')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Exams
            </button>

            <button
              onClick={() => navigate('/student/stats')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Stats
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Exam Instructions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {examData.exam?.title || "Exam"}
              </h1>
              <p className="text-xl text-gray-600">
                {examData.exam?.description || "Please read the instructions carefully before starting."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Exam Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-semibold">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {examData.exam?.duration ? `${examData.exam.duration} minutes` : '30 minutes'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Group:</span>
                    <span className="font-semibold">{examData.exam?.group || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order:</span>
                    <span className="font-semibold">{examData.exam?.order || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-4">Instructions</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Read each question carefully before answering</li>
                  <li>• You can retake this exam multiple times</li>
                  <li>• Time will be tracked automatically</li>
                  <li>• Ensure stable internet connection</li>
                  <li>• Exam will auto-submit when time ends</li>
                  <li>• Choose only one answer for each question</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startExam}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-bold text-lg shadow-lg transform hover:scale-105"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = examData.exam?.questions?.[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Exam Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {examData.exam?.title}
              </h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {totalQuestions}
                {examData.exam?.group && ` • Group ${examData.exam.group}`}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Answered: {answeredCount}/{totalQuestions}
              </div>
              <div className={`px-6 py-3 rounded-xl font-bold text-lg ${
                timeLeft < 300 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Questions Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {examData.exam?.questions?.map((question, index) => (
                  <button
                    key={question._id}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white shadow-lg'
                        : answers[question._id]
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-sm text-gray-600">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 bg-gray-200 rounded"></div>
                  <span className="text-sm text-gray-600">Unanswered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQ?.questionText}
                </h2>

                {/* Options */}
                <div className="space-y-4">
                  {currentQ?.options?.map((option, index) => (
                    <label 
                      key={index}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        answers[currentQ._id] === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ._id}`}
                        value={option}
                        checked={answers[currentQ._id] === option}
                        onChange={() => handleAnswer(currentQ._id, option)}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-4 text-gray-700 font-medium text-lg">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="text-sm text-gray-500">
                  Question {currentQuestion + 1} of {totalQuestions}
                </div>

                {currentQuestion === totalQuestions - 1 ? (
                  <button
                    onClick={submitExam}
                    disabled={submitting}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all duration-200 font-medium flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Exam
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center"
                  >
                    Next
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}