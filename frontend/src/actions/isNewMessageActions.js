const setIsNewMessage = (isNewMessageObj) => {
    return {
        type: "SET_ISNEWMESSAGEREDUCER",
        payload: isNewMessageObj
    }
}

export default {
    setIsNewMessage
}