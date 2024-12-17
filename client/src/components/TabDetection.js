import React, { useState, useEffect } from 'react';

function useTabVisibility() {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    if (typeof document.hidden === "undefined") {
      console.log("Page Visibility API is not supported in this browser.");
      return;
    }

    console.log("Visibility change listener is being added.");

    const beepSound = new Audio('https://www.soundjay.com/button/beep-07.wav');

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('Tab switched away!');
        setTabSwitchCount((prevCount) => prevCount + 1); 

        if (!alertShown) {
          alert('You switched tabs!');
          beepSound.play();
          setAlertShown(true); 
        }

        if (tabSwitchCount + 1 === 2) {
          alert('You have switched tabs twice. The test is over!');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      console.log('Visibility change listener removed');
    };
  }, [tabSwitchCount, alertShown]);

  return { tabSwitchCount };
}

const TabDetection = () => {
  const { tabSwitchCount } = useTabVisibility();

  return (
    <div>
      <h1>{`You have switched tabs ${tabSwitchCount} times.`}</h1>
    </div>
  );
};

export default TabDetection;
