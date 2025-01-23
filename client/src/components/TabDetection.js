import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import beepSound from "../assets/beep.js";

function useTabVisibility({ onSubmitTest }) {
  const [tabSwitchCount, setTabSwitchCount] = useState(() => {
    const savedCount = parseInt(sessionStorage.getItem("tabSwitchCount")) || 0;
    // If they already have 5 or more switches, submit immediately
    if (savedCount >= 5) {
      setTimeout(() => {
        onSubmitTest("tabswitch");
      }, 0);
    }
    return savedCount;
  });
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [audio] = useState(new Audio(beepSound));
  const [lastSwitchTime, setLastSwitchTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof document.hidden === "undefined") {
      return;
    }

    audio.preload = "auto";
    audio.volume = 1.0;

    const playBeep = async () => {
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.error("Error playing beep:", error);
      }
    };

    const handleSwitch = async () => {
      const currentTime = Date.now();
      // Ignore switches that happen within 1 second of each other
      if (currentTime - lastSwitchTime < 1000) {
        return;
      }

      setLastSwitchTime(currentTime);

      setTabSwitchCount((prevCount) => {
        const newCount = prevCount + 1;
        sessionStorage.setItem("tabSwitchCount", newCount.toString());

        playBeep();

        if (newCount === 1) {
          setWarningMessage(
            "Warning: You switched away from the test! This is your first warning."
          );
          setShowWarningModal(true);
        } else if (newCount === 3) {
          setWarningMessage(
            "Warning: You have switched away 3 times. You have 2 more attempts before the test ends."
          );
          setShowWarningModal(true);
        } else if (newCount === 5) {
          setWarningMessage(
            "You have switched away 5 times. The test will end when you click Understood."
          );
          setShowWarningModal(true);
        }
        return newCount;
      });
    };

    let switchTimeout;
    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Clear any existing timeout
        if (switchTimeout) {
          clearTimeout(switchTimeout);
        }
        // Set a new timeout
        switchTimeout = setTimeout(handleSwitch, 100);
      }
    };

    // Handle window focus changes
    const handleWindowBlur = () => {
      // Only handle blur if document is not hidden (to avoid double counting with visibility change)
      if (document.visibilityState !== "hidden") {
        if (switchTimeout) {
          clearTimeout(switchTimeout);
        }
        switchTimeout = setTimeout(handleSwitch, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    const initAudio = () => {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch((error) => console.error("Error initializing audio:", error));
      document.removeEventListener("click", initAudio);
    };
    document.addEventListener("click", initAudio);

    return () => {
      if (switchTimeout) {
        clearTimeout(switchTimeout);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("click", initAudio);
      audio.pause();
      audio.src = "";
    };
  }, [navigate, audio, onSubmitTest, lastSwitchTime]);

  return {
    tabSwitchCount,
    showWarningModal,
    warningMessage,
    setShowWarningModal,
  };
}

const TabDetection = ({ onSubmitTest }) => {
  const {
    tabSwitchCount,
    showWarningModal,
    warningMessage,
    setShowWarningModal,
  } = useTabVisibility({ onSubmitTest });

  return (
    <>
      <div style={{ display: "none" }}>
        <span>{tabSwitchCount}</span>
      </div>
      {showWarningModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ color: "#dc3545", marginBottom: "15px" }}>Warning</h3>
            <p style={{ marginBottom: "20px", fontSize: "16px" }}>
              {warningMessage}
            </p>
            <button
              onClick={() => {
                setShowWarningModal(false);
                if (tabSwitchCount >= 5) {
                  onSubmitTest("tabswitch");
                }
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TabDetection;
