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

    function onNext(){
        if(trace < queue?.length){
            if(check !== undefined){
                dispatch(updateResult({ trace, checked: check }));
            }
            
            if(trace === queue?.length - 1){
                navigate('/feedback');
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

    if(isLoading) return <h3 className='text-light'>isLoading</h3>
    if(serverError) return <h3 className='text-light'>{serverError || "Unknown Error"}</h3>
    if(!queue || !queue[trace]) return <h3 className='text-light'>Loading questions...</h3>

    return (
        <div className='container'>
            {!isFullscreen && (
                <div className="fullscreen-notice" style={{
                    backgroundColor: '#fff3cd',
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
                                backgroundColor: '#856404',
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

            <div className='questions'>
                <h2 className='text-light'>{queue[trace]?.question}</h2>

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
