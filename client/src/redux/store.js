import { combineReducers, legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { questionReducer } from './question_reducer';
import { resultReducer } from './result_reducer';
import { authReducer } from './auth_reducer';

const rootReducer = combineReducers({
    questions: questionReducer,
    result: resultReducer,
    auth: authReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));
export default store;

