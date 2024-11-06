//Direct Message Repository

import DirectMessage from './directMessage.model.js';
import Conversation from '../directMessage/conversation.model.js';

const createDirectMessage = (message) => {
  return DirectMessage.create(message);
};

const getDirectMessageByConversationId = (conversationId) => {
  return DirectMessage.find({ conversationId }).populate('senderId');
};

const createConversation = (conversation) => {
  return Conversation.create(conversation);
};

//get conversation by members array(contain 2 members)
const getConversationByMembers = (members) => {
  return Conversation.findOne({ members: { $all: members } });
};

export default {
  createDirectMessage,
  getDirectMessageByConversationId,
  createConversation,
  getConversationByMembers,
};
