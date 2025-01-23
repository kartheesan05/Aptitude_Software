import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import beepSound from "../assets/beep.js";

function useTabVisibility({ onSubmitTest }) {
  const [tabSwitchCount, setTabSwitchCount] = useState(() => {
    const savedCount = parseInt(sessionStorage.getItem("tabSwitchCount")) || 0;
    // If they already have 2 or more switches, submit immediately
    if (savedCount >= 2) {
      setTimeout(() => {
        onSubmitTest().then(() => {
          navigate("/feedback?t=tabswitch");
        });
      }, 0);
    }
    return savedCount;
  });
  const [alertShown, setAlertShown] = useState(false);
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

        if (newCount === 1 && !alertShown) {
          alert(
            "Warning: You switched away from the test! This is your first warning."
          );
          setAlertShown(true);
        } else if (newCount === 2) {
          alert("You have switched away twice. The test will now end.");
          onSubmitTest().then(() => {
            navigate("/feedback?t=tabswitch");
          });
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
  }, [alertShown, navigate, audio, onSubmitTest, lastSwitchTime]);

  return { tabSwitchCount };
}

const TabDetection = ({ onSubmitTest }) => {
  const { tabSwitchCount } = useTabVisibility({ onSubmitTest });

  return (
    <div style={{ display: "none" }}>
      <span>{tabSwitchCount}</span>
    </div>
  );
};

export default TabDetection;
