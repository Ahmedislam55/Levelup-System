"use client";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import api from "../../utils/api";
import { getStoredRole } from "../../utils/auth";

export default function Home() {
  const [userStats, setUserStats] = useState([]);
  const [levelExamStats, setLevelExamStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState({});

  // Fetch data from API
  const getDashboardData = async () => {
    try {
      const role = getStoredRole();
      let endpoint = "/admin/dashboard"; // default for admin

      if (role === "TEACHER") {
        endpoint = "/teacher/dashboard";
      } else if (role === "STUDENT") {
        endpoint = "/student/levels/stats";
      }

      const res = await api.get(endpoint);
      const data = res.data.data || {};

      let userStatsData = [];
      let levelExamStatsData = [];

      if (role === "ADMIN") {
        setCount(data);
        userStatsData = [
          {
            name: "Admins",
            value: data.adminsCount || 0,
            color: "#f59e0b",
            icon: "👨‍💼",
          },
          {
            name: "Teachers",
            value: data.teachersCount || 0,
            color: "#10b981",
            icon: "👨‍🏫",
          },
          {
            name: "Students",
            value: data.studentsCount || 0,
            color: "#3b82f6",
            icon: "👨‍🎓",
          },
        ];
        levelExamStatsData = [
          {
            name: "Levels",
            value: data.levelsCount || 0,
            color: "#8b5cf6",
            icon: "📚",
          },
          {
            name: "Exams",
            value: data.examsCount || 0,
            color: "#ef4444",
            icon: "📝",
          },
        ];
      } else if (role === "TEACHER") {
        setCount({
          studentsCount: data.students.count,
          levelsCount: data.levels.count,
          examsCount: data.exams.count,
        });
        userStatsData = [
          {
            name: "Students",
            value: data.students.count || 0,
            color: "#3b82f6",
            icon: "👨‍🎓",
          },
        ];
        levelExamStatsData = [
          {
            name: "Levels",
            value: data.levels.count || 0,
            color: "#8b5cf6",
            icon: "📚",
          },
          {
            name: "Exams",
            value: data.exams.count || 0,
            color: "#ef4444",
            icon: "📝",
          },
        ];
      } else if (role === "STUDENT") {
        setCount({
          completedExams: data.firstScoresCount,
          totalExams: data.totalExams,
          percentage: data.percentage,
        });
        userStatsData = [
          {
            name: "Completed Exams",
            value: data.firstScoresCount || 0,
            color: "#10b981",
            icon: "✅",
          },
          {
            name: "Progress %",
            value: data.percentage || 0,
            color: "#f59e0b",
            icon: "📊",
          },
        ];
        levelExamStatsData = [
          {
            name: "Total Exams",
            value: data.totalExams || 0,
            color: "#3b82f6",
            icon: "📝",
          },
        ];
      }

      setUserStats(userStatsData);
      setLevelExamStats(levelExamStatsData);
    } catch (err) {
      console.error("❌ Error loading dashboard data:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getDashboardData();
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalUsers = userStats.reduce((acc, curr) => acc + curr.value, 0);
  const totalLevelExam = levelExamStats.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome to your education management dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* User Stats */}
          {userStats.map((stat, index) => (
            <div
              key={`user-${index}`}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 transition-all duration-300 hover:shadow-lg"
              style={{ borderLeftColor: stat.color }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalUsers > 0 ? (stat.value / totalUsers) * 100 : 0
                      }%`,
                      backgroundColor: stat.color,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {/* Level and Exam Stats */}
          {levelExamStats.map((stat, index) => (
            <div
              key={`level-exam-${index}`}
              className="bg-white rounded-xl shadow-md p-6 border-l-4 transition-all duration-300 hover:shadow-lg"
              style={{ borderLeftColor: stat.color }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalLevelExam > 0
                          ? (stat.value / totalLevelExam) * 100
                          : 0
                      }%`,
                      backgroundColor: stat.color,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {userStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Count"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Level & Exam Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Levels & Exams
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelExamStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value) => [value, "Count"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                    {levelExamStats.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Combined Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Statistics Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...userStats, ...levelExamStats]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value) => [value, "Count"]}
                />
                <Legend />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                  {[...userStats, ...levelExamStats].map((entry, index) => (
                    <Cell key={`combined-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
