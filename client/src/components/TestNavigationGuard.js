import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TestNavigationGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const testState = {
        ongoingTest: sessionStorage.getItem("ongoingTest") === "true",
        testTaken: sessionStorage.getItem("testTaken") === "true",
        testPage: sessionStorage.getItem("testPage"),
      };

      const currentPath = location.pathname;

      // Handle mobile restriction page separately
      if (currentPath === "/mobile-restriction") return;

      // During quiz
      if (testState.ongoingTest && testState.testPage === "quiz") {
        if (currentPath !== "/quiz") {
          navigate("/quiz", { replace: true });
        }
        return;
      }

      // During instructions
      if (testState.ongoingTest && testState.testPage === "instructions") {
        if (currentPath !== "/instructions") {
          navigate("/instructions", { replace: true });
        }
        return;
      }

      // After test completion
      if (testState.testTaken && !currentPath.startsWith("/feedback")) {
        // Use a more graceful notification method if needed
        navigate("/feedback", { replace: true });
        return;
      }
    } catch (error) {
      // Handle any session storage errors
      console.error("Error in TestNavigationGuard:", error);
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default TestNavigationGuard;
