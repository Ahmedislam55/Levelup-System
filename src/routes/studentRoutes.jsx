import React from "react";
import StudentLevelPage from "../pages/student/StudentLevelPage";
import StudentExamPage from "../pages/student/StudentExamPage";
import StudentStatsPage from "../pages/student/StudentStatsPage";

// Student-only routes
const studentRoutes = [
  { path: "student/levels", element: <StudentLevelPage /> },
  { path: "student/levels/exams/:examId", element: <StudentExamPage /> },
  { path: "student/stats", element: <StudentStatsPage /> },
];

export default studentRoutes;
