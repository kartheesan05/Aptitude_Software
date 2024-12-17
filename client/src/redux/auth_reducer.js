export const authReducer = (state = {
    username: '',
    email: '',
    department: '',
    departmentId: ''
}, action) => {
    switch (action.type) {
        case 'SET_USER_DETAILS':
            return {
                ...state,
                ...action.payload
            }
        default:
            return state;
    }
}
