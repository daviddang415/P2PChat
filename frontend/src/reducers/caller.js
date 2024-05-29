const callerReducer = (state = "", action) => {
    switch(action.type) {
        case "SET_CALLER":
            return action.payload;
        default:
            return state;
    }
};

export default callerReducer;