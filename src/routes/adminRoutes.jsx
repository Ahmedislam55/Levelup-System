import React from "react";
import UsersPage from "../pages/admin/UsersPage";
import ActiveTeachersPage from "../pages/admin/ActiveTeachersPage";
import LevelsPage from "../pages/admin/LevelsPage";
import AssignmentsPage from "../pages/admin/AssignmentsPage";
import TeachersPage from "../pages/admin/TeachersPage";
import StudentPage from "../pages/admin/StudentPage";
import UploadExamPage from "../pages/admin/UploadExamPage";
import SignupPage from "../pages/admin/SignupPage";

// Admin-only routes
const adminRoutes = [
  { path: "users", element: <UsersPage /> },
  { path: "teachers", element: <TeachersPage /> },
  { path: "students", element: <StudentPage /> },
  { path: "teachers/active", element: <ActiveTeachersPage /> },
  { path: "levels", element: <LevelsPage /> },
  {
    path: "upload-exam/teacher/:teacherId/level/:levelId",
    element: <UploadExamPage />,
  },
  { path: "assignments", element: <AssignmentsPage /> },
  { path: "signup", element: <SignupPage /> },
];

export default adminRoutes;


