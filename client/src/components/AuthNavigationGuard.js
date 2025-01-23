import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthNavigationGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const currentPath = location.pathname;

    // List of public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/admin-login",
      "/mobile-restriction",
      "/success",
    ];

    // If no token and trying to access a protected route, redirect to home
    if (!token && !publicRoutes.includes(currentPath)) {
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default AuthNavigationGuard;
