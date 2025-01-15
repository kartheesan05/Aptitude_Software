import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useFetchQestion, MoveNextQuestion, MovePrevQuestion } from '../hooks/FetchQuestion'
import { updateResult } from '../redux/result_reducer'
import '../styles/App.css'
import TabDetection from './TabDetection'
import axios from 'axios'
import { postServerData } from '../helper/helper'
import QuestionNavigation from './QuestionNavigation'
import DeviceDetection from './DeviceDetection'

export default function Quiz() {
    const [check, setChecked] = useState(undefined)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [endTime, setEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { 
        questions: { queue, answers, trace, categories },
        result: { 
            result, 
            username,
            email,
            regNo,
            department,
            departmentId
        }
    } = useSelector(state => state);

    const [{ isLoading, serverError }] = useFetchQestion();

    const enterFullscreen = async () => {
        try {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
            setIsFullscreen(true);
        } catch (error) {
            console.log('Fullscreen request failed');
        }
    };

    useEffect(() => {
        if(!username) {
            navigate('/');
            return;
        }
        dispatch({ type: 'SET_TRACE', payload: 0 });
        dispatch({ type: 'SET_RESULT', payload: [] });
        setChecked(undefined);
        enterFullscreen();
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        if(queue && queue.length > 0) {
            dispatch({ type: 'SET_TRACE', payload: 0 });
            
            if (!result.length) {
                dispatch({ type: 'SET_RESULT', payload: Array(queue.length).fill(undefined) });
            }
        }
    }, [queue]);

    useEffect(() => {
        console.log("Current trace:", trace);
        console.log("Current result:", result);
        setChecked(result[trace]);
    }, [trace]);

    useEffect(() => {
        const preventBackButton = (e) => {
            e.preventDefault();
            e.returnValue = '';
            alert("Please use the navigation buttons within the quiz. Don't use browser navigation.");
        };

        const preventBackNavigation = () => {
            alert("Please use the navigation buttons within the quiz. Don't use browser navigation.");
            navigate('/quiz', { replace: true });
        };

        window.addEventListener('beforeunload', preventBackButton);
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', preventBackNavigation);

        return () => {
            window.removeEventListener('beforeunload', preventBackButton);
            window.removeEventListener('popstate', preventBackNavigation);
        };
    }, [navigate]);

    function onNext(){
        if(trace < queue?.length){
            if(check !== undefined){
                dispatch(updateResult({ trace, checked: check }));
            }
            
            if(trace === queue?.length - 1){
                const unanswered = getUnansweredQuestions();
                if (unanswered.length > 0) {
                    setShowConfirmation(true);
                } else {
                    navigate('/feedback', { state: { fromQuiz: true } });
                }
                return;
            }

            dispatch(MoveNextQuestion());
        }
    }

    function onPrev(){
        if(trace > 0){
            dispatch(MovePrevQuestion());
        }
    }

    function onSelect(i) {
        setChecked(i);
        dispatch(updateResult({ trace, checked: i }));
    }

    const getUnansweredQuestions = () => {
        return result
            .map((ans, index) => ({ index: index + 1, answered: ans !== undefined }))
            .filter(q => !q.answered)
            .map(q => q.index);
    };

    const fetchEndTime = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/timer/endtime');
            const serverTime = new Date(response.data.endTime);
            const istTime = new Date(serverTime.getTime() + (5.5 * 60 * 60 * 1000));
            setEndTime(istTime);
        } catch (error) {
            console.error('Error fetching timer end time:', error);
            const defaultTime = new Date(Date.now() + 90* 60000 + (5.5 * 60 * 60 * 1000));
            setEndTime(defaultTime);
        }
    };

    useEffect(() => {
        fetchEndTime();
    }, []);

    useEffect(() => {
        if (!endTime) return;

        const updateTimeLeft = () => {
            const now = new Date();
            const difference = endTime - now;
            
            if (difference <= 0) {
                setTimeLeft(0);
                handleTimeUp();
                return;
            }
            
            setTimeLeft(Math.floor(difference / 1000)); // Convert to seconds
        };

        updateTimeLeft(); // Initial update
        const timer = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    const handleTimeUp = async () => {
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
                totalQuestions: queue.length
            };

            await postServerData(
                `${process.env.REACT_APP_SERVER_HOSTNAME}/api/result`,
                resultData
            );

            navigate('/feedback', { 
                replace: true, 
                state: { fromQuiz: true, resultSubmitted: true }
            });
        } catch (error) {
            console.error('Error handling time up:', error);
        }
    };

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600)/ 60);
        const remainingSeconds = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const categorizeQuestions = (questions) => {
        return questions.reduce((acc, q, index) => {
            if (index < 15) {
                acc.aptitude.push({ ...q, index });
            } else if (index < 30) {
                acc.core.push({ ...q, index });
            } else if (index < 40) {
                acc.verbal.push({ ...q, index });
            } else {
                acc.programming.push({ ...q, index });
            }
            return acc;
        }, {
            aptitude: [],
            core: [],
            verbal: [],
            programming: []
        });
    };

    const getQuestionsByCategory = () => {
        if (!queue || !Array.isArray(queue)) return null;
        
        return {
            aptitude: queue.filter((q, i) => i < 15),
            core: queue.filter((q, i) => i >= 15 && i < 30),
            verbal: queue.filter((q, i) => i >= 30 && i < 40),
            programming: queue.filter((q, i) => i >= 40 && i < 50)
        };
    };

    const getCurrentCategoryQuestions = () => {
        const categorizedQuestions = getQuestionsByCategory();
        if (!categorizedQuestions) return [];

        if (trace < 15) return categorizedQuestions.aptitude;
        if (trace < 30) return categorizedQuestions.core;
        if (trace < 40) return categorizedQuestions.verbal;
        return categorizedQuestions.programming;
    };

    const getCurrentCategory = () => {
        if (trace < 15) return 'Aptitude';
        if (trace < 30) return 'Core';
        if (trace < 40) return 'Verbal';
        return 'Programming';
    };

    const getCurrentQuestion = () => {
        if (!queue || !Array.isArray(queue)) return null;
        const currentQuestion = queue[trace];
        if (!currentQuestion) return null;

        return {
            ...currentQuestion,
            categoryName: getCurrentCategory()
        };
    };

    useEffect(() => {
        const checkDevice = () => {
            const isMobileDevice = (
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(navigator.userAgent) ||
                window.innerWidth <= 800 ||
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0
            );

            if (isMobileDevice) {
                navigate('/mobile-restriction', { replace: true });
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    if(isLoading) return <h3 className='text-light'>isLoading</h3>
    if(serverError) return <h3 className='text-light'>{serverError || "Unknown Error"}</h3>
    if(!queue || !queue[trace]) return <h3 className='text-light'>Loading questions...</h3>

    return (
        <div className="container">
            <DeviceDetection />
            <QuestionNavigation />
            <div className="main-content">
                <h2 className="section-title">{getCurrentCategory()} Section</h2>
                {!isFullscreen && (
                    <div className="fullscreen-notice" style={{
                        backgroundColor: '#17c6e5',
                        color: '#856404',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '4px',
                        textAlign: 'center'
                    }}>
                        <p>You exited fullscreen mode. 
                            <button 
                                onClick={enterFullscreen}
                                style={{
                                    marginLeft: '10px',
                                    padding: '5px 10px',
                                    border: 'none',
                                    borderRadius: '3px',
                                    backgroundColor: '#136b7f',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Return to Fullscreen
                            </button>
                        </p>
                    </div>
                )}

                <div className="timer" style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: timeLeft <= 60 ? '#ff4444' : '#1eb2a6',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    fontSize: '1.2em',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'background-color 0.3s ease'
                }}>
                    Time Left: {formatTime(timeLeft)}
                </div>

                <TabDetection />

                {showConfirmation && (
                <div className="confirmation-dialog" style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxWidth: '90%',
                    width: '400px',
                }}>
                    <h3 style={{
                        marginBottom: '15px',
                        color: '#007bff',
                        fontSize: '18px',
                        fontWeight: 'bold',
                    }}>
                        Unanswered Questions
                    </h3>
                    <p style={{
                        color: '#000', 
                        fontSize: '16px',
                    }}>
                        You have not answered the following questions:
                        <br />
                        <span style={{
                            fontWeight: 'bold',
                            display: 'block',
                            marginTop: '10px',
                            color: '#000', 
                            fontSize: '16px',
                        }}>
                            {getUnansweredQuestions().join(', ')}
                        </span>
                    </p>
                    <div style={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                        <button
                            onClick={() => setShowConfirmation(false)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                        >
                            Continue Answering
                        </button>
                        <button
                            onClick={() => navigate('/feedback', { 
                                state: { fromQuiz: true, resultSubmitted: true } 
                            })}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                        >
                            Submit Anyway
                        </button>
                    </div>
                </div>
)}


                {getCurrentQuestion() && (
                    <div className='questions'>
                        <h2 className='text-light'>
                            {getCurrentQuestion().question}
                        </h2>

                        {getCurrentQuestion().image && (
                            <div className="question-image-container">
                                <img 
                                    src={`http://localhost:5000${getCurrentQuestion().image}`} 
                                    alt="Question" 
                                    className="question-image"
                                />
                            </div>
                        )}

                        <ul key={`question-${trace}`}>
                            {getCurrentQuestion().options?.map((q, i) => (
                                <li key={`q${trace}-${i}`}>
                                    <input 
                                        type="radio"
                                        value={i}
                                        name={`question-${trace}`}
                                        id={`q${trace}-${i}`}
                                        onChange={() => onSelect(i)}
                                        checked={check === i}
                                    />
                                    <label className='text-primary' htmlFor={`q${trace}-${i}`}>{q}</label>
                                    <div className={`check ${check === i ? 'checked' : ''}`}></div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className='grid'>
                    {trace > 0 ? 
                        <button className='btn prev' onClick={onPrev} style={{width: '100px'}}>Prev</button> 
                        : <div></div>
                    }
                    <button className='btn next' onClick={onNext} style={{width: '100px'}}>
                        {trace === queue?.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    )
}
