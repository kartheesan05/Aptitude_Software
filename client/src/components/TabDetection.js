import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useTabVisibility() {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [alertShown, setAlertShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof document.hidden === "undefined") {
      console.log("Page Visibility API is not supported in this browser.");
      return;
    }

    console.log("Tab detection initialized");

    // Create audio element for beep sound
    const beepSound = new Audio('https://www.soundjay.com/button/beep-07.wav');
    beepSound.load(); // Preload the sound

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('Tab switched away!');
        setTabSwitchCount(prevCount => {
          const newCount = prevCount + 1;
          console.log('Switch count:', newCount);

          if (newCount === 1 && !alertShown) {
            // First switch
            beepSound.play().catch(err => console.log('Error playing sound:', err));
            alert('Warning: You switched tabs! This is your first warning.');
            setAlertShown(true);
          } else if (newCount === 2) {
            // Second switch
            beepSound.play().catch(err => console.log('Error playing sound:', err));
            alert('You have switched tabs twice. The test will now end.');
            navigate('/feedback'); // Navigate to results page
          }

          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log('Tab detection cleanup');
    };
  }, [alertShown, navigate]);

  return { tabSwitchCount };
}

const TabDetection = () => {
  const { tabSwitchCount } = useTabVisibility();

  return (
    <div style={{ display: 'none' }}>
      {/* Hidden component that just handles tab detection */}
      <span>{tabSwitchCount}</span>
    </div>
  );
};

export default TabDetection;
