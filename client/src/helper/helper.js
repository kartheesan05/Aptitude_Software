import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import axios from 'axios'

/** check user auth  */
export function CheckUserExist({ children }){
    const { username } = useSelector(state => state.result);
    
    // Debug log
    console.log("CheckUserExist - username:", username);
    
    return username ? children : <Navigate to={'/'} replace={true} />;
}

/** get server data */
export async function getServerData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

/** post server data */
export async function postServerData(url, result) {
    try {
        console.log('Posting to URL:', url);
        console.log('Posting data:', result);
        
        const response = await axios.post(url, result);
        console.log("Server Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error posting result:", error.response?.data || error.message);
        throw error;
    }
}
