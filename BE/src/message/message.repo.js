import Message from "./message.model.js";

const getAllMessageByChannelId = (channelId) => {
    return Message.find({ channelId }).populate("senderId");
}

const getMessageById = (messageId) => {
    return Message.findOne({ _id: messageId }).populate("channelId");
}

const createMessage = (message) => {
    return Message.create(message);
}

const deleteMessage = (messageId) => {
    return Message.findOneAndDelete({ _id: messageId });
}


export default {
    getMessageById,
    getAllMessageByChannelId,
    createMessage,
    deleteMessage,
};