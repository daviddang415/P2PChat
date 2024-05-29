const idToCallReducer = (state = "", action) => {
    switch(action.type) {
        case "SET_IDTOCALL":
            return action.payload;
        default:
            return state;
    }
};

export default idToCallReducer;