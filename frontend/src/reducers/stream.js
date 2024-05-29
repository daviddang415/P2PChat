const streamReducer = (state = null, action) => {
    switch(action.type) {
        case "SET_STREAM":
            return action.payload;
        default:
            return state;
    }
};

export default streamReducer;