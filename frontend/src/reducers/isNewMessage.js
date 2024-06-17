const isNewMessageReducer = (state = false, action) => {
    switch(action.type) {
        case "SET_ISNEWMESSAGEREDUCER":
            return action.payload;
        default:
            return state;
    }
};

export default isNewMessageReducer;