import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DevToolsBlocker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle devtools detection from index.html
    const handleDevToolsDetected = () => {
      navigate("/dev-tools-blocked");
    };

    window.addEventListener("devtoolsDetected", handleDevToolsDetected);

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e) => {
      // Prevent F12 key
      if (e.keyCode === 123) {
        e.preventDefault();
      }

      // Prevent Ctrl+Shift+I (Windows) and Command+Option+I (Mac)
      if (
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
        (e.metaKey && e.altKey && e.keyCode === 73)
      ) {
        e.preventDefault();
      }

      // Prevent Ctrl+Shift+C (Windows) and Command+Option+C (Mac)
      if (
        (e.ctrlKey && e.shiftKey && e.keyCode === 67) ||
        (e.metaKey && e.altKey && e.keyCode === 67)
      ) {
        e.preventDefault();
      }

      // Prevent Ctrl+Shift+J (Windows) and Command+Option+J (Mac)
      if (
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) ||
        (e.metaKey && e.altKey && e.keyCode === 74)
      ) {
        e.preventDefault();
      }

      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
      }
    };

    // Add keyboard and context menu prevention
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("devtoolsDetected", handleDevToolsDetected);
    };
  }, [navigate]);

  return null;
};

export default DevToolsBlocker;
