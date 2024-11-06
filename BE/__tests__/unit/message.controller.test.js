import httpMocks from 'node-mocks-http';
import messageController from '../../src/message/message.controller.js';
import messageService from '../../src/message/message.service.js';
import userService from '../../src/user/user.service.js';
import msg from '../../langs/en.js';
import response from '../../util/response.js';
import dotenv from 'dotenv';

dotenv.config();

jest.mock('../../src/message/message.service.js');
jest.mock('../../src/user/user.service.js');

let req, res, next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
  jest.clearAllMocks();
});

describe('Message Controller', () => {
  describe('createMessage', () => {
    it('should create a message and return success response', async () => {
      req.params = { channelId: 'mockChannelId' };
      req.user = { userId: 'mockUserId' };
      req.body = { text: 'Hello!' };

      const mockCreatedMessage = {
        senderId: 'mockUserId',
        channelId: 'mockChannelId',
        message: 'Hello!',
      };
      const mockSender = {
        _id: 'mockUserId',
        name: 'Sender',
        imageUrl: 'sender.png',
      };

      messageService.createMessage.mockResolvedValue(mockCreatedMessage);
      userService.getUserById.mockResolvedValue(mockSender);

      await messageController.createMessage(req, res, next);

      expect(messageService.createMessage).toHaveBeenCalledWith({
        ...req.body,
        senderId: 'mockUserId',
        channelId: 'mockChannelId',
      });
      expect(userService.getUserById).toHaveBeenCalledWith('mockUserId');
      expect(res.statusCode).toBe(msg.responseStatus.CREATED);
      expect(res._getJSONData()).toEqual(
        response(
          msg.responseStatus.CREATED,
          msg.transValidation.INPUT_CORRECT,
          {
            ...mockCreatedMessage._doc,
            senderId: {
              _id: mockSender._id,
              name: mockSender.name,
              imageUrl: mockSender.imageUrl,
            },
          }
        )
      );
    });

    it('should call next with error if creating message fails', async () => {
      req.params = { channelId: 'mockChannelId' };
      req.user = { userId: 'mockUserId' };
      req.body = { text: 'Hello!' };

      const mockError = new Error('Creating message failed');
      messageService.createMessage.mockRejectedValue(mockError);

      await messageController.createMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getAllMessageByChannelId', () => {
    it('should return all messages for a channel', async () => {
      req.params = { channelId: 'mockChannelId' };

      const mockMessages = [
        {
          senderId: {
            _id: 'mockUserId',
            name: 'Sender',
            imageUrl: 'sender.png',
          },
          text: 'Hello!',
        },
      ];

      messageService.getAllMessageByChannelId.mockResolvedValue(mockMessages);

      await messageController.getAllMessageByChannelId(req, res, next);

      expect(messageService.getAllMessageByChannelId).toHaveBeenCalledWith(
        'mockChannelId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.SUCCESS);
      const expectedResponse = mockMessages.map((message) => ({
        ...message._doc,
        senderId: {
          _id: message.senderId._id,
          name: message.senderId.name,
          imageUrl: `${process.env.CLIENT_URL}/${message.senderId.imageUrl.replace(/\\/g, '/')}`,
        },
      }));

      expect(res._getJSONData()).toEqual(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          expectedResponse
        )
      );
    });

    it('should call next with error if fetching messages fails', async () => {
      req.params = { channelId: 'mockChannelId' };

      const mockError = new Error('Fetching messages failed');
      messageService.getAllMessageByChannelId.mockRejectedValue(mockError);

      await messageController.getAllMessageByChannelId(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message and return success response', async () => {
      req.body = { messageId: 'mockMessageId' };
      req.user = { userId: 'mockUserId' };

      await messageController.deleteMessage(req, res, next);

      expect(messageService.deleteMessage).toHaveBeenCalledWith(
        'mockUserId',
        'mockMessageId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.SUCCESS);
      expect(res._getJSONData()).toEqual(
        response(msg.responseStatus.SUCCESS, msg.transValidation.INPUT_CORRECT)
      );
    });

    it('should call next with error if deleting message fails', async () => {
      req.body = { messageId: 'mockMessageId' };
      req.user = { userId: 'mockUserId' };

      const mockError = new Error('Deleting message failed');
      messageService.deleteMessage.mockRejectedValue(mockError);

      await messageController.deleteMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
