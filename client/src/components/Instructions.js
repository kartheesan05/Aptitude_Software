import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "../styles/Instructions.css";
import DeviceDetection from "./DeviceDetection";
import api from "../axios/axios";

export default function Instructions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sessionRole = sessionStorage.getItem("role");
    if (!sessionRole) {
      navigate("/");
      return;
    }
    setRole(sessionRole);
    sessionStorage.removeItem("quizState");
  }, [navigate]);

  useEffect(() => {
    const preventBackNavigation = () => {
      alert(
        "Please use the provided buttons to navigate. Don't use browser navigation."
      );
      navigate("/instructions", { replace: true });
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, [navigate]);

  const startQuiz = async () => {
    if (role !== "student") {
      navigate("/");
      return;
    }

    try {
      setIsLoading(true);
      // Reset trace before starting quiz
      dispatch({ type: "SET_TRACE", payload: 0 });

      // Fetch questions from server
      const response = await api.post("/api/users/create-session");
      const { questions } = response.data;

      // Store questions in session storage
      sessionStorage.setItem("quizQuestions", JSON.stringify(questions));

      // Navigate to quiz after storing questions
      navigate("/quiz");
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="instructions-container" style={{ backgroundColor: "red" }}>
      <DeviceDetection />

      <div className="instructions-card">
        <h2 className="instructions-header">Quiz Instructions</h2>

        <div className="instructions-content">
          <div className="instruction-item">
            <span className="instruction-number">1</span>
            <p>The quiz contains multiple choice questions.</p>
          </div>

          <div className="instruction-item">
            <span className="instruction-number">2</span>
            <p>Each question has only one correct answer.</p>
          </div>

          <div className="instruction-item">
            <span className="instruction-number">3</span>
            <p>You cannot go back to previous questions once answered.</p>
          </div>

          <div className="instruction-item">
            <span className="instruction-number">4</span>
            <p>Each correct answer will earn you points.</p>
          </div>

          <div className="instruction-item">
            <span className="instruction-number">5</span>
            <p>There is no negative marking.</p>
          </div>

          <div className="instruction-item">
            <span className="instruction-number">6</span>
            <p>Do not refresh the page during the quiz.</p>
          </div>
        </div>

        <div className="instructions-action">
          <button
            onClick={startQuiz}
            className="start-quiz-btn"
            disabled={isLoading}
          >
            {isLoading ? "Loading Questions..." : "Start Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
