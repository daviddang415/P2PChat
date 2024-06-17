const showChatReducer = (state = false, action) => {
    switch(action.type) {
        case "SET_SHOWCHAT":
            return action.payload;
        default:
            return state;
    }
};

export default showChatReducer;