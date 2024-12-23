import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { startExamAction, moveNextAction, movePrevAction, setTraceAction } from '../redux/question_reducer'
import axios from 'axios'

/** fetch question hook to fetch api data and set value to store */
export const useFetchQestion = () => {
    const dispatch = useDispatch();
    const [getData, setGetData] = useState({ 
        isLoading: false, 
        apiData: [], 
        serverError: null 
    });
    
    const { departmentId } = useSelector(state => state.result);

    useEffect(() => {
        setGetData(prev => ({...prev, isLoading: true}));

        (async () => {
            try {
                console.log("Fetching questions for department:", departmentId);
                
                const { data } = await axios.get(`http://localhost:5000/api/questions/${departmentId}`);
                console.log("Received questions data:", data);

                if(data && data[0]?.questions?.length > 0){
                    setGetData(prev => ({...prev, isLoading: false}));
                    setGetData(prev => ({...prev, apiData: data[0].questions}));

                    // First dispatch to reset trace
                    dispatch(setTraceAction(0));
                    
                    // Then dispatch start exam action
                    dispatch(startExamAction({
                        question: data[0].questions,
                        answers: data[0].answers
                    }));

                } else {
                    throw new Error("No Questions Available");
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
                setGetData(prev => ({
                    ...prev, 
                    isLoading: false, 
                    serverError: error.message || "Error while fetching questions"
                }));
            }
        })();
    }, [dispatch, departmentId]);

    return [getData, setGetData];
}

/** MoveAction Dispatch function */
export const MoveNextQuestion = () => async (dispatch) => {
    try {
        dispatch(moveNextAction())
    } catch (error) {
        console.log(error)
    }
}

/** PrevAction Dispatch function */
export const MovePrevQuestion = () => async (dispatch) => {
    try {
        dispatch(movePrevAction())
    } catch (error) {
        console.log(error)
    }
}