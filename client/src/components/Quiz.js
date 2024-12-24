import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useFetchQestion, MoveNextQuestion, MovePrevQuestion } from '../hooks/FetchQuestion'
import { updateResult } from '../redux/result_reducer'
import '../styles/App.css'
import TabDetection from './TabDetection'

export default function Quiz() {
    const [check, setChecked] = useState(undefined)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { 
        questions: { queue, answers, trace },
        result: { result, username }
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

    if(isLoading) return <h3 className='text-light'>isLoading</h3>
    if(serverError) return <h3 className='text-light'>{serverError || "Unknown Error"}</h3>
    if(!queue || !queue[trace]) return <h3 className='text-light'>Loading questions...</h3>

    return (
        <div className='container'>
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
                        onClick={() => navigate('/feedback', { state: { fromQuiz: true } })}
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


            <div className='questions'>
                <h2 className='text-light'>
                    <span style={{ 
                        marginRight: '10px',
                        fontWeight: 'normal'
                    }}>
                        {trace + 1}) 
                    </span>
                    {queue[trace]?.question}
                </h2>

                <ul key={`question-${trace}`}>
                    {queue[trace]?.options?.map((q, i) => (
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

            <div className='grid'>
                {trace > 0 ? 
                    <button className='btn prev' onClick={onPrev}>Prev</button> 
                    : <div></div>
                }
                <button className='btn next' onClick={onNext}>
                    {trace === queue?.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    )
}
