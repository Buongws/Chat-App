import messageService from '../../src/message/message.service.js';
import messageRepo from '../../src/message/message.repo.js';
import CustomError from '../../util/error.js';
import msg from '../../langs/en.js';
import mongoose from 'mongoose';

jest.mock('../../src/message/message.repo.js');
jest.mock('../../util/error.js');

describe('Message Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a message', async () => {
      const mockMessage = { content: 'Hello World' };
      messageRepo.createMessage.mockResolvedValue(mockMessage);

      const result = await messageService.createMessage(mockMessage);

      expect(messageRepo.createMessage).toHaveBeenCalledWith(mockMessage);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getAllMessageByUserId', () => {
    it('should get all messages by user ID', async () => {
      const mockMessages = [{ content: 'Hello World' }];
      messageRepo.getMessageById.mockResolvedValue(mockMessages);

      const result = await messageService.getAllMessageByUserId('mockUserId');

      expect(messageRepo.getMessageById).toHaveBeenCalledWith('mockUserId');
      expect(result).toEqual(mockMessages);
    });
  });

  describe('getAllMessageByChannelId', () => {
    it('should get all messages by channel ID', async () => {
      const mockMessages = [{ content: 'Hello World' }];
      messageRepo.getAllMessageByChannelId.mockResolvedValue(mockMessages);

      const result =
        await messageService.getAllMessageByChannelId('mockChannelId');

      expect(messageRepo.getAllMessageByChannelId).toHaveBeenCalledWith(
        'mockChannelId'
      );
      expect(result).toEqual(mockMessages);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message if the user is the sender', async () => {
      const mockMessage = { senderId: 'mockUserId' };
      messageRepo.getMessageById.mockResolvedValue(mockMessage);
      messageRepo.deleteMessage.mockResolvedValue();

      await messageService.deleteMessage('mockUserId', 'mockMessageId');

      expect(messageRepo.getMessageById).toHaveBeenCalledWith('mockMessageId');
      expect(messageRepo.deleteMessage).toHaveBeenCalledWith('mockMessageId');
    });

    it('should throw an error if the message is not found', async () => {
      messageRepo.getMessageById.mockResolvedValue(null);

      await expect(
        messageService.deleteMessage('mockUserId', 'mockMessageId')
      ).rejects.toBeInstanceOf(CustomError);

      expect(messageRepo.getMessageById).toHaveBeenCalledWith('mockMessageId');
      expect(CustomError).toHaveBeenCalledWith(
        msg.errorCode.NOT_FOUND,
        msg.responseStatus.NOT_FOUND
      );
    });

    it('should throw an error if the user is not the sender', async () => {
      const mockMessage = { senderId: new mongoose.Types.ObjectId() };
      messageRepo.getMessageById.mockResolvedValue(mockMessage);

      await expect(
        messageService.deleteMessage('mockUserId', 'mockMessageId')
      ).rejects.toBeInstanceOf(CustomError);

      expect(messageRepo.getMessageById).toHaveBeenCalledWith('mockMessageId');
      expect(CustomError).toHaveBeenCalledWith(
        msg.errorCode.FORBIDDEN,
        msg.responseStatus.FORBIDDEN
      );
    });
  });
});
