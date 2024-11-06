// Direct Message Controller
import directMessageService from './directMessage.service.js';
import msg from '../../langs/en.js';
import response from '../../util/response.js';
import userService from '../user/user.service.js';
import dotenv from 'dotenv';
dotenv.config();

export const sendDirectMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { recipientId, message } = req.body;
    const sender = await userService.getUserById(userId);    
    const newMessage = await directMessageService.sendDirectMessage(
      userId,
      recipientId,
      message
    );
    const customMessage = {
        ...newMessage._doc,
        senderId: {
            senderId: sender._id,
            name: sender.name,
            imageUrl: sender.imageUrl.replace(/\\/g, '/'),
        },
        };
    return res
      .status(msg.responseStatus.CREATED)
      .json(
        response(
          msg.responseStatus.CREATED,
          msg.transValidation.INPUT_CORRECT,
          customMessage
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getMessagesByConversation = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { recipientId } = req.params;
    const conversationId = await directMessageService.getConversationByMembers([
      userId,
      recipientId,
    ]);
    let messages;
    if (!conversationId) {
      messages = [];
      return res
        .status(msg.responseStatus.SUCCESS)
        .json(
          response(
            msg.responseStatus.SUCCESS,
            msg.transValidation.INPUT_CORRECT,
            messages
          )
        );
    } else {
      messages =
        await directMessageService.getMessagesByConversation(conversationId);
      const customerMessages = messages.map((message) => ({
        ...message._doc,
        senderId: {
          senderId: message.senderId._id,
          name: message.senderId.name,
          imageUrl: `${process.env.CLIENT_URL}/${message.senderId.imageUrl.replace(/\\/g, '/')}`,
        },
      }));
      return res
        .status(msg.responseStatus.SUCCESS)
        .json(
          response(
            msg.responseStatus.SUCCESS,
            msg.transValidation.INPUT_CORRECT,
            customerMessages || messages
          )
        );
    }
  } catch (error) {
    next(error);
  }
};

export default {
  sendDirectMessage,
  getMessagesByConversation,
};
