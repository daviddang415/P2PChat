const audioOnReducer = (state = true, action) => {
    switch(action.type) {
        case "SET_AUDIOON":
            return action.payload;
        default:
            return state;
    }
};

export default audioOnReducer;