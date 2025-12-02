import "flowbite";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { hasRequiredRole } from "./utils/auth";

// Components
import LayOut from "./componets/LayOut/LayOut";
import Login from "./componets/Login/Login";
import Home from "./componets/Home/Home";
import ForgetPassword from "./componets/ForgetPassword/ForgetPassword";
// Pages
import ProfilePage from "./pages/admin/ProfilePage";
import UploadExamPage from "./pages/admin/UploadExamPage";
import adminRoutes from "./routes/adminRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import studentRoutes from "./routes/studentRoutes";
import ResetPassword from "./componets/ResetPassword/ResetPassword";

// دالة عشان تتحقق من وجود الـ login
const isAuthenticated = () => {
  return localStorage.getItem("accessToken"); // أو أي شرط تاني انت عامل بيه login
};

// Component بيمنع الدخول لو مش عامل login
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Role-based protection wrapper
function RequireRole({ role, children }) {
  if (!hasRequiredRole(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const router = createBrowserRouter([
    // Public routes
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/forgetPassword",
      element: <ForgetPassword />,
    },
    {
      path: "/resetPassword",
      element: <ResetPassword />,
    },

    // Protected Dashboard routes
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <LayOut />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Home /> },
        // Admin
        ...adminRoutes.map((r) => ({
          ...r,
          element: <RequireRole role={["ADMIN"]}>{r.element}</RequireRole>,
        })),
        // Upload exam accessible by Admin & Teacher
        {
          path: "upload-exam/level/:levelId",
          element: (
            <RequireRole role={["ADMIN", "TEACHER"]}>
              <UploadExamPage />
            </RequireRole>
          ),
        },
        { path: "profile", element: <ProfilePage /> },
        // Teacher
        ...teacherRoutes.map((r) => ({
          ...r,
          element: <RequireRole role={["TEACHER"]}>{r.element}</RequireRole>,
        })),
        // Student
        ...studentRoutes.map((r) => ({
          ...r,
          element: <RequireRole role={["STUDENT"]}>{r.element}</RequireRole>,
        })),
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
