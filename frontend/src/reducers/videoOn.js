const videoOnReducer = (state = true, action) => {
    switch(action.type) {
        case "SET_VIDEOON":
            return action.payload;
        default:
            return state;
    }
};

export default videoOnReducer;