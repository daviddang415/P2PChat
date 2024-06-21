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
import showSidebarReducer from "./showSidebar";
import showChatReducer from "./showChat";
import messageReducer from "./message";
import messageLogReducer from "./messageLog";
import isNewMessageReducer from "./isNewMessage";
import userNameReducer from "./userName";
import numUnseenMessagesReducer from "./numUnseenMessages";

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
    audioOn: audioOnReducer,
    showSidebar: showSidebarReducer,
    showChat: showChatReducer,
    message: messageReducer,
    messageLog: messageLogReducer,
    isNewMessage: isNewMessageReducer,
    userName: userNameReducer,
    numUnseenMessages: numUnseenMessagesReducer
});

export default allReducers;