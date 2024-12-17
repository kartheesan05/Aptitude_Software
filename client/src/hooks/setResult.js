import * as Action from '../redux/result_reducer'
import { postServerData } from '../helper/helper'

export const PushAnswer = (result) => async (dispatch) => {
    try {
        await dispatch(Action.pushResultAction(result))
    } catch (error) {
        console.log(error)
    }
}

export const updateResult = (index) => async (dispatch) => {
    try {
        dispatch(Action.updateResultAction(index))
    } catch (error) {
        console.log(error)
    }
}

/** insert user data */
export const usePublishResult = (resultData) => {
    const { result, username, email, department } = resultData;
    
    (async () => {
        try {
            if(!result || !username || !email || !department) throw new Error("Couldn't get Result");
            
            console.log("Sending result data:", resultData);
            await postServerData(`${process.env.REACT_APP_SERVER_HOSTNAME}/api/result`, resultData, data => data);
            
        } catch (error) {
            console.log(error)
        }
    })();
}

