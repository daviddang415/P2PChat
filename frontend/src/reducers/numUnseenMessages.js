const numUnseenMessagesReducer = (state = 0, action) => {
    switch(action.type) {
        case "SET_NUMUNSEENMESSAGES":
            return action.payload;
        case "INC_NUMUNSEENMESSAGES":
            return state + 1;
        default:
            return state;
    }
};

export default numUnseenMessagesReducer;