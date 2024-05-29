const callEndedReducer = (state = false, action) => {
    switch(action.type) {
        case "SET_CALLENDED":
            return action.payload;
        default:
            return state;
    }
};

export default callEndedReducer;