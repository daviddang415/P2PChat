const messageLogReducer = (state = [], action) => {
    switch(action.type) {
        case "SET_MESSAGELOG":
            //console.log("yeepy", [...state, action.payload])
            //const temp = [...state, action.payload]
            return [...state, action.payload];
        case "RESET_MESSAGELOG":
            //console.log("yeepy", [...state, action.payload])
            //const temp = [...state, action.payload]
            return [];
        default:
            return state;
    }
};

export default messageLogReducer;