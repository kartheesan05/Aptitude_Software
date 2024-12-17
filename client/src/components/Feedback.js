import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { postServerData } from '../helper/helper';

export default function Feedback() {
    const { queue } = useSelector(state => state.questions);
    const { result, username, email, department } = useSelector(state => state.result);

    useEffect(() => {
        console.log("Feedback Component Mounted");
        console.log("Current State:", {
            queue,
            result,
            username,
            email,
            department
        });

        console.log("Redux result state:", {
            resultLength: result?.length,
            resultData: result,
            isArray: Array.isArray(result)
        });

        const storeResult = async () => {
            try {
                const resultData = {
                    username,
                    email,
                    dept: department,
                    result: result,
                    attempts: result.filter(r => r !== undefined).length,
                    points: result.reduce((prev, curr, idx) => {
                        return prev + (curr === queue[idx]?.correct ? 10 : 0)
                    }, 0)
                };

                console.log("About to send result data:", resultData);
                console.log("Server URL:", `${process.env.REACT_APP_SERVER_HOSTNAME}/api/result`);
                
                const response = await postServerData(`${process.env.REACT_APP_SERVER_HOSTNAME}/api/result`, resultData);
                console.log("Server Response:", response);
            } catch (error) {
                console.error("Detailed error:", {
                    message: error.message,
                    stack: error.stack,
                    response: error.response
                });
            }
        };

        if(result && result.length > 0) {
            console.log("Calling storeResult");
            storeResult();
        } else {
            console.log("No results to store. Result data:", result);
        }
    }, [queue, result, username, email, department]);

    return (
        <div className="container">
            <h1 className="title text-light">Feedback</h1>
            <div className="feedback-form">
                <h2>Please provide your feedback</h2>
                {/* Add your feedback form here */}
            </div>
        </div>
    );
}
