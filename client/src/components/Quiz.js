import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useFetchQestion, MoveNextQuestion, MovePrevQuestion } from '../hooks/FetchQuestion'
import { updateResult } from '../redux/result_reducer'
import '../styles/App.css'
import TabDetection from './TabDetection'

export default function Quiz() {
    const [check, setChecked] = useState(undefined)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { 
        questions: { queue, answers, trace },
        result: { result }
    } = useSelector(state => state);

    const [{ isLoading, serverError }] = useFetchQestion();

    useEffect(() => {
        console.log("Current trace:", trace);
        console.log("Current result:", result);
        setChecked(result[trace]);
    }, [trace]);

    function onNext(){
        if(trace < queue?.length){
            // Update result before moving to next question
            if(check !== undefined){
                dispatch(updateResult({ trace, checked: check }));
            }
            
            // Navigate to feedback on last question
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
        console.log("Selected answer for question", trace + 1, ":", i);
        setChecked(i);
        dispatch(updateResult({ trace, checked: i }));
    }

    if(isLoading) return <h3 className='text-light'>isLoading</h3>
    if(serverError) return <h3 className='text-light'>{serverError || "Unknown Error"}</h3>

    return (
        <div className='container'>
            <TabDetection />
            {/* <h1 className='title text-light'>Quiz Application</h1> */}

            <div className='questions'>
                <h2 className='text-light'>{queue?.[trace]?.question}</h2>

                <ul key={`question-${trace}`}>
                    {queue?.[trace]?.options?.map((q, i) => (
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
