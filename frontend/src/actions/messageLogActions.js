const setMessageLog = (messageLogObj) => {
    return {
        type: "SET_MESSAGELOG",
        payload: messageLogObj
    }
}

const resetMessageLog = () => {
    return {
        type: "RESET_MESSAGELOG"
    }
}

export default {
    setMessageLog,
    resetMessageLog
}