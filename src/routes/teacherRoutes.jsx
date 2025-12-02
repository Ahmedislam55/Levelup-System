import React from "react";
import TeacherStudentsPage from "../pages/teacher/TeacherStudentsPage";
import TeacherLevelsPage from "../pages/teacher/TeacherLevelsPage";
import TeacherExamsPage from "../pages/teacher/TeacherExamsPage";
import LevelStudentsPage from "../pages/teacher/LevelStudentsPage";
import ExamDetailsPage from "../pages/teacher/TeacherExamPage";
import TeacherReportPage from "../pages/teacher/TeacherReportPage";
import StudentReportPage from "../pages/teacher/StudentReportPage";

// Teacher-only routes
const teacherRoutes = [
  { path: "teacher/students", element: <TeacherStudentsPage /> },
  { path: "teacher/levels", element: <TeacherLevelsPage /> },
  { path: "teacher/exams", element: <TeacherExamsPage /> },
  { path: "teacher/levels/:levelId/students", element: <LevelStudentsPage /> },
  { path: "teacher/exams/:examId", element: <ExamDetailsPage /> },
  { path: "teacher/report", element: <TeacherReportPage /> },
  { path: "teacher/report/:studentId", element: <StudentReportPage /> },
];

export default teacherRoutes;


