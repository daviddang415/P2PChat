const setNumUnseenMessages = (numUnseenMessagesObj) => {
    return {
        type: "SET_NUMUNSEENMESSAGES",
        payload: numUnseenMessagesObj
    }
}

const incNumUnseenMessages = () => {
    return {
        type: "INC_NUMUNSEENMESSAGES",
    }
}

export default {
    setNumUnseenMessages,
    incNumUnseenMessages
}