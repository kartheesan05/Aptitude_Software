import React, { useEffect } from 'react';
import '../styles/Result.css';
import { Link } from 'react-router-dom';
import ResultTable from './ResultTable';
import { useDispatch, useSelector } from 'react-redux';
import { attempts_Number } from '../helper/helper';
import { postServerData } from '../helper/helper';

import { resetAllAction } from '../redux/question_reducer';
import { resetResultAction } from '../redux/result_reducer';

export default function Result() {
    const dispatch = useDispatch();

    // Destructure the necessary state slices from Redux store
    const { 
        questions: { queue = [], answers = [] },
        result: { result = [], username = '', email = '', regNo = '', department = '', departmentId = '' }
    } = useSelector(state => state);

    useEffect(() => {
        console.log("Result Component State:", {
            queue, answers, result, username, email, regNo, department, departmentId
        });
    }, [queue, answers, result, username, email, regNo, department, departmentId]);

    // Calculate total questions and correct answers
    const totalQuestions = queue.length;
    const correctAnswers = result.reduce((score, answer, index) => {
        return score + (answer === answers[index] ? 1 : 0);
    }, 0);

    /** store result in the database */
    useEffect(() => {
        const publishResult = async () => {
            try {
                if(result.length && queue.length && username && email) {
                    const resultData = {
                        username,
                        email,
                        regNo,
                        department,
                        departmentId,
                        result: result,
                        attempts: 1,  // Since we're only allowing one attempt
                        points: correctAnswers, // One point per correct answer
                        totalQuestions
                    };
    
                    console.log("Publishing result data:", resultData);
                    const response = await postServerData(`${process.env.REACT_APP_SERVER_HOSTNAME}/api/result`, resultData);
                    console.log("Server response:", response);
                }
            } catch (error) {
                console.error("Error publishing result:", error);
            }
        };

        publishResult();
    }, []);

    // Reset the quiz when the user clicks restart
    function onRestart() {
        dispatch(resetAllAction());
        dispatch(resetResultAction());
    }

    return (
        <div className='container'>
            <h1 className='title text-light'>Quiz Results</h1>

            <div className='result flex-center'>
                <div className='flex'>
                    <span>Username</span>
                    <span className='bold'>{username}</span>
                </div>
                <div className='flex'>
                    <span>Registration Number</span>
                    <span className='bold'>{regNo}</span>
                </div>
                <div className='flex'>
                    <span>Department</span>
                    <span className='bold'>{department}</span>
                </div>
                <div className='flex'>
                    <span>Total Questions : </span>
                    <span className='bold'>{totalQuestions}</span>
                </div>
                <div className='flex'>
                    <span>Score : </span>
                    <span className='bold'>{correctAnswers} out of {totalQuestions}</span>
                </div>
            </div>

            <div className="start">
                <Link className='btn' to={'/'} onClick={onRestart}>Finish</Link>
            </div>

            <div className="container">
                <ResultTable />
            </div>
        </div>
    );
}
