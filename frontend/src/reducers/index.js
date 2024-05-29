import callAcceptedReducer from "./callAccepted";
import callEndedReducer from "./callEnded";
import callerReducer from "./caller";
import idToCallReducer from "./idToCall"
import meReducer from "./me";
import nameReducer from "./name";
import receivingCallReducer from "./receivingCall";
import streamReducer from "./stream";
import callerSignalReducer from "./callerSignal";
import videoOnReducer from "./videoOn";
import audioOnReducer from "./audioOn";

import {combineReducers} from 'redux';

const allReducers = combineReducers({
    callAccepted: callAcceptedReducer,
    callEnded: callEndedReducer,
    caller: callerReducer,
    idToCall: idToCallReducer,
    me: meReducer,
    name: nameReducer,
    receivingCall: receivingCallReducer,
    stream: streamReducer,
    callerSignal: callerSignalReducer,
    videoOn: videoOnReducer,
    audioOn: audioOnReducer
});

export default allReducers;