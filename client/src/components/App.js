import "../styles/App.css";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import MobileRestriction from "./MobileRestriction";
import DevToolsBlocker from "./DevToolsBlocker";
import TestNavigationGuard from "./TestNavigationGuard";
import AuthNavigationGuard from "./AuthNavigationGuard";

import Login from "./Login";
import Quiz from "./Quiz";
import Instructions from "./Instructions";
import Feedback from "./Feedback";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import QuestionUpload from "./QuestionUpload";
import Success from "./Success";
import ResultsPage from "./ResultsPage";

// Layout component that includes DevToolsBlocker
const Layout = () => {
  return (
    <>
      <DevToolsBlocker />
      <TestNavigationGuard />
      <AuthNavigationGuard />
      <Outlet />
    </>
  );
};

/** React Routes */
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/instructions",
        element: <Instructions />,
      },
      {
        path: "/quiz",
        element: <Quiz />,
      },
      {
        path: "/feedback",
        element: <Feedback />,
      },
      {
        path: "/admin-login",
        element: <AdminLogin />,
      },
      {
        path: "/admin-dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/question-upload",
        element: <QuestionUpload />,
      },
      {
        path: "/success",
        element: <Success />,
      },
      {
        path: "/mobile-restriction",
        element: <MobileRestriction />,
      },
      {
        path: "/results",
        element: <ResultsPage />,
      },
    ],
  },
]);

// Scroll restoration
if (typeof window !== "undefined") {
  window.scrollTo(0, 0);
}

function App() {
  return <RouterProvider router={router} />;
}
export default App;
