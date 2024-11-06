//Message Controller
import messageService from './message.service.js';
import msg from '../../langs/en.js';
import response from '../../util/response.js';
import userService from '../user/user.service.js';
import dotenv from 'dotenv';
dotenv.config();

const createMessage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.user;
    const message = {
      ...req.body,
      senderId: userId,
      channelId,
    };
    const createdMessage = await messageService.createMessage(message);
    const sender = await userService.getUserById(createdMessage.senderId);
    const customMessage = {
      ...createdMessage._doc,
      senderId: {
        _id: sender._id,
        name: sender.name,
        imageUrl: sender.imageUrl,
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

const getAllMessageByChannelId = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const messages = await messageService.getAllMessageByChannelId(channelId);

    const customMessages = messages.map((message) => ({
      ...message._doc,
      senderId: {
        _id: message.senderId._id,
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
          customMessages
        )
      );
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.body;
    const userId = req.user.userId;
    await messageService.deleteMessage(userId, messageId);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(msg.responseStatus.SUCCESS, msg.transValidation.INPUT_CORRECT)
      );
  } catch (error) {
    next(error);
  }
};

export default {
  createMessage,
  getAllMessageByChannelId,
  deleteMessage,
};
