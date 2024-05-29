const setCallEnded = (callEndedObj) => {
    return {
        type: "SET_CALLENDED",
        payload: callEndedObj
    }
}

export default {
    setCallEnded
}