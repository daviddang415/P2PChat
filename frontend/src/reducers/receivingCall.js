const receivingCallReducer = (state = false, action) => {
    switch(action.type) {
        case "SET_RECEIVINGCALL":
            return action.payload;
        default:
            return state;
    }
};

export default receivingCallReducer;