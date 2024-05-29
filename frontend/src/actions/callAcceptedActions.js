const setCallAccepted = (callAcceptedObj) => {
    return {
        type: "SET_CALLACCEPTED",
        payload: callAcceptedObj
    }
}

export default {
    setCallAccepted
}