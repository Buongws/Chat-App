// Direct Message Service
import directMessageRepository from './directMessage.repo.js';
import CustomError from '../../util/error.js';
import msg from '../../langs/en.js';

const sendDirectMessage = async (senderId, recipientId, message) => {
    // if(senderId === recipientId){
    //    throw new CustomError(
    //     msg.errorCode.BAD_REQUEST,
    //     msg.responseStatus.BAD_REQUEST
    //    );
    // }
    let conversation = await directMessageRepository.getConversationByMembers([senderId, recipientId]);

    // Create a conversation if it doesn't exist
    if (!conversation) {
        conversation = await directMessageRepository.createConversation({
            members: [senderId, recipientId],
        });
    }
    // Create the direct message
    const newMessage = {
        conversationId: conversation._id,
        senderId,
        message,
    };
    return directMessageRepository.createDirectMessage(newMessage);
};

const getConversationByMembers = async (members) => {
    return directMessageRepository.getConversationByMembers(members);
};

const getMessagesByConversation = async (conversationId) => {
    return directMessageRepository.getDirectMessageByConversationId(conversationId);
};

export default {
    sendDirectMessage,
    getMessagesByConversation,
    getConversationByMembers,
};

