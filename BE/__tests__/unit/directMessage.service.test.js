import directMessageService from '../../src/directMessage/directMessage.service.js';
import directMessageRepository from '../../src/directMessage/directMessage.repo.js';
import CustomError from '../../util/error.js';
// import msg from '../../src/langs/en.js';

jest.mock('../../src/directMessage/directMessage.repo.js');

describe('Direct Message Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendDirectMessage', () => {
    it('should send a direct message when conversation exists', async () => {
      const senderId = 'mockSenderId';
      const recipientId = 'mockRecipientId';
      const message = 'Hello!';
      const mockConversation = { _id: 'mockConversationId' };
      const mockNewMessage = {
        conversationId: 'mockConversationId',
        senderId,
        message,
      };

      directMessageRepository.getConversationByMembers.mockResolvedValue(
        mockConversation
      );
      directMessageRepository.createDirectMessage.mockResolvedValue(
        mockNewMessage
      );

      const result = await directMessageService.sendDirectMessage(
        senderId,
        recipientId,
        message
      );

      expect(
        directMessageRepository.getConversationByMembers
      ).toHaveBeenCalledWith([senderId, recipientId]);
      expect(directMessageRepository.createDirectMessage).toHaveBeenCalledWith({
        conversationId: mockConversation._id,
        senderId,
        message,
      });
      expect(result).toEqual(mockNewMessage);
    });

    it('should create a conversation and send a direct message when conversation does not exist', async () => {
      const senderId = 'mockSenderId';
      const recipientId = 'mockRecipientId';
      const message = 'Hello!';
      const mockConversation = { _id: 'mockConversationId' };
      const mockNewMessage = {
        conversationId: 'mockConversationId',
        senderId,
        message,
      };

      directMessageRepository.getConversationByMembers.mockResolvedValue(null);
      directMessageRepository.createConversation.mockResolvedValue(
        mockConversation
      );
      directMessageRepository.createDirectMessage.mockResolvedValue(
        mockNewMessage
      );

      const result = await directMessageService.sendDirectMessage(
        senderId,
        recipientId,
        message
      );

      expect(
        directMessageRepository.getConversationByMembers
      ).toHaveBeenCalledWith([senderId, recipientId]);
      expect(directMessageRepository.createConversation).toHaveBeenCalledWith({
        members: [senderId, recipientId],
      });
      expect(directMessageRepository.createDirectMessage).toHaveBeenCalledWith({
        conversationId: mockConversation._id,
        senderId,
        message,
      });
      expect(result).toEqual(mockNewMessage);
    });
  });

  describe('getConversationByMembers', () => {
    it('should get conversation by members', async () => {
      const members = ['mockSenderId', 'mockRecipientId'];
      const mockConversation = { _id: 'mockConversationId', members };

      directMessageRepository.getConversationByMembers.mockResolvedValue(
        mockConversation
      );

      const result =
        await directMessageService.getConversationByMembers(members);

      expect(
        directMessageRepository.getConversationByMembers
      ).toHaveBeenCalledWith(members);
      expect(result).toEqual(mockConversation);
    });
  });

  describe('getMessagesByConversation', () => {
    it('should get messages by conversation ID', async () => {
      const conversationId = 'mockConversationId';
      const mockMessages = [
        { conversationId, senderId: 'mockSenderId', message: 'Hello!' },
      ];

      directMessageRepository.getDirectMessageByConversationId.mockResolvedValue(
        mockMessages
      );

      const result =
        await directMessageService.getMessagesByConversation(conversationId);

      expect(
        directMessageRepository.getDirectMessageByConversationId
      ).toHaveBeenCalledWith(conversationId);
      expect(result).toEqual(mockMessages);
    });
  });
});
