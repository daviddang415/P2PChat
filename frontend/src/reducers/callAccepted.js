const callAcceptedReducer = (state = false, action) => {
    switch(action.type) {
        case "SET_CALLACCEPTED":
            return action.payload;
        default:
            return state;
    }
};

export default callAcceptedReducer;