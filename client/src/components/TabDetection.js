import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { postServerData } from '../helper/helper';
import beepSound from '../assets/beep.js';

function useTabVisibility() {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [alertShown, setAlertShown] = useState(false);
  const [audio] = useState(new Audio(beepSound));
  const navigate = useNavigate();

  // Get required data from Redux store
  const { 
    result: { username, email, regNo, department, departmentId },
    questions: { queue, answers },
    result: { result }
  } = useSelector(state => state);

  const submitResult = async () => {
    try {
      const resultData = {
        username,
        email,
        regNo,
        department,
        departmentId,
        result,
        attempts: result.filter(r => r !== undefined).length,
        points: result.reduce((score, ans, i) => 
          score + (Number(ans) === Number(answers[i]) ? 1 : 0), 0),
        totalQuestions: queue?.length || 0
      };

      await postServerData(
        `${process.env.REACT_APP_SERVER_HOSTNAME}/api/result`,
        resultData
      );

      console.log('Result submitted due to tab switching');
    } catch (error) {
      console.error('Error submitting result:', error);
    }
  };

  useEffect(() => {
    if (typeof document.hidden === "undefined") {
      console.log("Page Visibility API is not supported in this browser.");
      return;
    }

    console.log("Tab detection initialized");

    audio.preload = 'auto';
    audio.volume = 1.0;

    const playBeep = async () => {
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (error) {
        console.error('Error playing beep:', error);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        console.log('Tab switched away!');
        setTabSwitchCount(prevCount => {
          const newCount = prevCount + 1;
          console.log('Switch count:', newCount);

          playBeep();

          if (newCount === 1 && !alertShown) {
            alert('Warning: You switched tabs! This is your first warning.');
            setAlertShown(true);
          } else if (newCount === 2) {
            alert('You have switched tabs twice. The test will now end.');
            submitResult().then(() => {
              navigate('/feedback', { 
                state: { 
                  fromQuiz: true, 
                  resultSubmitted: true,
                  tabSwitchViolation: true 
                } 
              });
            });
          }

          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const initAudio = () => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(error => console.error('Error initializing audio:', error));
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', initAudio);
      audio.pause();
      audio.src = '';
      console.log('Tab detection cleanup');
    };
  }, [alertShown, navigate, audio, queue, answers, result]);

  return { tabSwitchCount };
}

const TabDetection = () => {
  const { tabSwitchCount } = useTabVisibility();

  return (
    <div style={{ display: 'none' }}>
      <span>{tabSwitchCount}</span>
    </div>
  );
};

export default TabDetection;
