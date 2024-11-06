import {
  sendDirectMessage,
  getMessagesByConversation,
} from '../../src/directMessage/directMessage.controller.js';
import directMessageService from '../../src/directMessage/directMessage.service.js';
import userService from '../../src/user/user.service.js';
import msg from '../../langs/en.js';
import response from '../../util/response.js';

// Mock the required modules
jest.mock('../../src/directMessage/directMessage.service.js');
jest.mock('../../src/user/user.service.js');
jest.mock('../../util/response.js');

describe('Direct Message Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'user123' },
      body: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('sendDirectMessage', () => {
    it('should send a direct message successfully', async () => {
      const mockSender = {
        _id: 'user123',
        name: 'John Doe',
        imageUrl: 'path\\to\\image.jpg',
      };
      const mockMessage = { _doc: { _id: 'msg123', content: 'Hello' } };

      userService.getUserById.mockResolvedValue(mockSender);
      directMessageService.sendDirectMessage.mockResolvedValue(mockMessage);

      mockReq.body = { recipientId: 'recipient123', message: 'Hello' };

      await sendDirectMessage(mockReq, mockRes, mockNext);

      expect(userService.getUserById).toHaveBeenCalledWith('user123');
      expect(directMessageService.sendDirectMessage).toHaveBeenCalledWith(
        'user123',
        'recipient123',
        'Hello'
      );
      expect(mockRes.status).toHaveBeenCalledWith(msg.responseStatus.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.CREATED,
          msg.transValidation.INPUT_CORRECT,
          {
            ...mockMessage._doc,
            senderId: {
              senderId: mockSender._id,
              name: mockSender.name,
              imageUrl: mockSender.imageUrl.replace(/\\/g, '/'),
            },
          }
        )
      );
    });

    it('should call next with error if an exception occurs', async () => {
      const error = new Error('Test error');
      userService.getUserById.mockRejectedValue(error);

      await sendDirectMessage(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getMessagesByConversation', () => {
    it('should return an empty array when conversation does not exist', async () => {
      directMessageService.getConversationByMembers.mockResolvedValue(null);

      mockReq.params = { recipientId: 'recipient123' };

      await getMessagesByConversation(mockReq, mockRes, mockNext);

      expect(
        directMessageService.getConversationByMembers
      ).toHaveBeenCalledWith(['user123', 'recipient123']);
      expect(mockRes.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(mockRes.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          []
        )
      );
    });

    it('should return messages when conversation exists', async () => {
      const mockConversationId = 'conv123';
      const mockMessages = [
        {
          _doc: { _id: 'msg1', content: 'Hi' },
          senderId: {
            _id: 'user123',
            name: 'John',
            imageUrl: 'path\\to\\image.jpg',
          },
        },
        {
          _doc: { _id: 'msg2', content: 'Hello' },
          senderId: {
            _id: 'recipient123',
            name: 'Jane',
            imageUrl: 'path\\to\\image2.jpg',
          },
        },
      ];

      directMessageService.getConversationByMembers.mockResolvedValue(
        mockConversationId
      );
      directMessageService.getMessagesByConversation.mockResolvedValue(
        mockMessages
      );

      mockReq.params = { recipientId: 'recipient123' };

      await getMessagesByConversation(mockReq, mockRes, mockNext);

      expect(
        directMessageService.getConversationByMembers
      ).toHaveBeenCalledWith(['user123', 'recipient123']);
      expect(
        directMessageService.getMessagesByConversation
      ).toHaveBeenCalledWith(mockConversationId);
      expect(mockRes.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(mockRes.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          expect.arrayContaining([
            expect.objectContaining({
              ...mockMessages[0]._doc,
              senderId: {
                senderId: mockMessages[0].senderId._id,
                name: mockMessages[0].senderId.name,
                imageUrl: expect.stringContaining(
                  mockMessages[0].senderId.imageUrl.replace(/\\/g, '/')
                ),
              },
            }),
            expect.objectContaining({
              ...mockMessages[1]._doc,
              senderId: {
                senderId: mockMessages[1].senderId._id,
                name: mockMessages[1].senderId.name,
                imageUrl: expect.stringContaining(
                  mockMessages[1].senderId.imageUrl.replace(/\\/g, '/')
                ),
              },
            }),
          ])
        )
      );
    });

    it('should call next with error if an exception occurs', async () => {
      const error = new Error('Test error');
      directMessageService.getConversationByMembers.mockRejectedValue(error);

      await getMessagesByConversation(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
