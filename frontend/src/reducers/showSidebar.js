const showSidebarReducer = (state = false, action) => {
    switch(action.type) {
        case "SET_SHOWSIDEBAR":
            return action.payload;
        default:
            return state;
    }
};

export default showSidebarReducer;