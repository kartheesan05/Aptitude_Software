import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useFetchQestion, MoveNextQuestion, MovePrevQuestion } from '../hooks/FetchQuestion'
import { updateResult } from '../hooks/setResult'
import '../styles/App.css'

export default function Quiz() {
    const [check, setChecked] = useState(undefined)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Get state from Redux
    const { questions: { queue, answers }, result: { result } } = useSelector(state => state);
    const [{ isLoading, serverError, apiData }] = useFetchQestion();
    const trace = useSelector(state => state.questions.trace);

    useEffect(() => {
        console.log("Quiz State:", {
            queue,
            trace,
            result,
            check
        });
    }, [queue, trace, result, check]);

    function onNext(){
        if(trace < queue?.length){
            // Update result before moving to next question
            if(check !== undefined){
                dispatch(updateResult({ trace, checked: check }));
            }
            
            // If this is the last question
            if(trace === queue?.length - 1){
                navigate('/feedback');
                return;
            }

            dispatch(MoveNextQuestion());
            setChecked(undefined);
        }
    }

    function onPrev(){
        if(trace > 0){
            dispatch(MovePrevQuestion());
            setChecked(result[trace - 1]);
        }
    }

    function onChecked(i){
        setChecked(i);
    }

    if(isLoading) return <h3 className='text-light'>isLoading</h3>
    if(serverError) return <h3 className='text-light'>{serverError || "Unknown Error"}</h3>

    return (
        <div className='container'>
            <h1 className='title text-light'>Quiz Application</h1>

            <div className='questions'>
                <h2 className='text-light'>{queue?.[trace]?.question}</h2>

                <ul>
                    {queue?.[trace]?.options?.map((q, i) => (
                        <li key={i}>
                            <input 
                                type="radio"
                                value={i}
                                name={`question_${trace}`}
                                id={`q${i}-option`}
                                onChange={() => onChecked(i)}
                                checked={check === i}
                            />
                            <label className='text-primary' htmlFor={`q${i}-option`}>{q}</label>
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
