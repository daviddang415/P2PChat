const callerSignalReducer = (state = null, action) => {
    switch(action.type) {
        case "SET_CALLERSIGNAL":
            return action.payload;
        default:
            return state;
    }
};

export default callerSignalReducer;