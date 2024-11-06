import messageRepo from './message.repo.js';
import CustomError from '../../util/error.js';
import msg from '../../langs/en.js';

const createMessage = async (message) => {
  return await messageRepo.createMessage(message);
};

const getAllMessageByUserId = async (userId) => {
  //return await messageRepo.getAllMessageByUserId(userId);
  return await messageRepo.getMessageById(userId);
};

const getAllMessageByChannelId = async (channelId) => {
  return await messageRepo.getAllMessageByChannelId(channelId);
};

//only sender can delete message
const deleteMessage = async (userId, messageId) => {
  const message = await messageRepo.getMessageById(messageId);
  if (!message) {
    throw new CustomError(
      msg.errorCode.NOT_FOUND,
      msg.responseStatus.NOT_FOUND
    );
  }
  console.log(message.senderId);

  if (message.senderId != userId) {
    throw new CustomError(
      msg.errorCode.FORBIDDEN,
      msg.responseStatus.FORBIDDEN
    );
  }

  return await messageRepo.deleteMessage(messageId);
};

export default {
  createMessage,
  getAllMessageByUserId,
  getAllMessageByChannelId,
  deleteMessage,
};
