import streamActions from "./streamActions";
import meActions from "./meActions";
import receivingCallActions from "./receivingCallActions";
import callerActions from "./callerActions";
import nameActions from "./nameActions";
import callerSignalActions from "./callerSignalActions";
import callAcceptedActions from "./callAcceptedActions";
import callEndedActions from "./callEndedActions";
import idToCallActions from "./idToCallActions";
import videoOnActions from "./videoOnActions";
import audioOnActions from "./audioOnActions";
import showSidebarActions from "./showSidebarActions";
import showChatActions from "./showChatActions";
import messageActions from "./messageActions";
import messageLogActions from "./messageLogActions";
import isNewMessageActions from "./isNewMessageActions";

const allActions = {
    receivingCallActions,
    callerActions,
    streamActions,
    meActions,
    nameActions,
    callerSignalActions,
    callAcceptedActions,
    callEndedActions,
    idToCallActions,
    videoOnActions,
    audioOnActions,
    showSidebarActions,
    showChatActions,
    messageActions,
    messageLogActions,
    isNewMessageActions
}

export default allActions;