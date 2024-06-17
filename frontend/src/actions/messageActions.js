const setMessage = (messageObj) => {
    return {
        type: "SET_MESSAGE",
        payload: messageObj
    }
}

export default {
    setMessage
}