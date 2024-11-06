import channelService from '../../src/channel/channel.service.js';
import channelRepo from '../../src/channel/channel.repo.js';
import CustomError from '../../util/error.js';
import msg from '../../langs/en.js';

jest.mock('../../src/channel/channel.repo.js');

describe('Channel Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChannelByServerId', () => {
    it('should return the channel when it exists', async () => {
      const channelId = 'mockChannelId';
      const mockChannel = { _id: channelId, name: 'mockChannel' };

      channelRepo.getChannelByServerId.mockResolvedValue(mockChannel);

      const result = await channelService.getChannelByServerId(channelId);

      expect(channelRepo.getChannelByServerId).toHaveBeenCalledWith(channelId);
      expect(result).toEqual(mockChannel);
    });

    it('should throw an error when the channel does not exist', async () => {
      const channelId = 'mockChannelId';

      channelRepo.getChannelByServerId.mockResolvedValue(null);

      await expect(
        channelService.getChannelByServerId(channelId)
      ).rejects.toThrow(CustomError);
    });
  });

  describe('createChannel', () => {
    it('should create a new channel when the name does not exist', async () => {
      const channel = { channelName: 'newChannel', server: 'mockServerId' };
      const mockNewChannel = { _id: 'mockChannelId', ...channel };

      channelRepo.getChannelByName.mockResolvedValue(null);
      channelRepo.createChannel.mockResolvedValue(mockNewChannel);

      const result = await channelService.createChannel(channel);

      expect(channelRepo.getChannelByName).toHaveBeenCalledWith(
        channel.channelName,
        channel.server
      );
      expect(channelRepo.createChannel).toHaveBeenCalledWith(channel);
      expect(result).toEqual(mockNewChannel);
    });

    it('should throw an error when the channel name already exists', async () => {
      const channel = {
        channelName: 'existingChannel',
        server: 'mockServerId',
      };
      const mockExistingChannel = { _id: 'mockChannelId', ...channel };

      channelRepo.getChannelByName.mockResolvedValue(mockExistingChannel);

      await expect(channelService.createChannel(channel)).rejects.toThrow(
        CustomError
      );
    });
  });

  describe('updateChannel', () => {
    it('should update the channel when it exists and the name is not changed', async () => {
      const channelId = 'mockChannelId';
      const channelData = { channelName: 'updatedChannel' };
      const mockExistingChannel = {
        _id: channelId,
        channelName: 'existingChannel',
        server: 'mockServerId',
      };
      const mockUpdatedChannel = { ...mockExistingChannel, ...channelData };

      channelRepo.getChannelByServerId.mockResolvedValue(mockExistingChannel);
      channelRepo.updateChannel.mockResolvedValue(mockUpdatedChannel);

      const result = await channelService.updateChannel(channelId, channelData);

      expect(channelRepo.getChannelByServerId).toHaveBeenCalledWith(channelId);
      expect(channelRepo.updateChannel).toHaveBeenCalledWith(
        channelId,
        channelData
      );
      expect(result).toEqual(mockUpdatedChannel);
    });

    it('should update the channel when it exists and the name is changed', async () => {
      const channelId = 'mockChannelId';
      const channelData = { channelName: 'newChannelName' };
      const mockExistingChannel = {
        _id: channelId,
        channelName: 'existingChannel',
        server: 'mockServerId',
      };
      const mockUpdatedChannel = { ...mockExistingChannel, ...channelData };

      channelRepo.getChannelByServerId.mockResolvedValue(mockExistingChannel);
      channelRepo.getChannelByName.mockResolvedValue(null);
      channelRepo.updateChannel.mockResolvedValue(mockUpdatedChannel);

      const result = await channelService.updateChannel(channelId, channelData);

      expect(channelRepo.getChannelByServerId).toHaveBeenCalledWith(channelId);
      expect(channelRepo.getChannelByName).toHaveBeenCalledWith(
        channelData.channelName,
        mockExistingChannel.server
      );
      expect(channelRepo.updateChannel).toHaveBeenCalledWith(
        channelId,
        channelData
      );
      expect(result).toEqual(mockUpdatedChannel);
    });

    it('should throw an error when the channel does not exist', async () => {
      const channelId = 'mockChannelId';
      const channelData = { channelName: 'updatedChannel' };

      channelRepo.getChannelByServerId.mockResolvedValue(null);

      await expect(
        channelService.updateChannel(channelId, channelData)
      ).rejects.toThrow(CustomError);
    });

    it('should throw an error when the new channel name already exists', async () => {
      const channelId = 'mockChannelId';
      const channelData = { channelName: 'newChannelName' };
      const mockExistingChannel = {
        _id: channelId,
        channelName: 'existingChannel',
        server: 'mockServerId',
      };
      const mockExistingChannelByName = {
        _id: 'anotherChannelId',
        channelName: 'newChannelName',
        server: 'mockServerId',
      };

      channelRepo.getChannelByServerId.mockResolvedValue(mockExistingChannel);
      channelRepo.getChannelByName.mockResolvedValue(mockExistingChannelByName);

      await expect(
        channelService.updateChannel(channelId, channelData)
      ).rejects.toThrow(CustomError);
    });
  });

  describe('deleteChannel', () => {
    it('should delete the channel when it exists', async () => {
      const channelId = 'mockChannelId';
      const mockDeletedChannel = { _id: channelId, name: 'mockChannel' };

      channelRepo.deleteChannel.mockResolvedValue(mockDeletedChannel);

      const result = await channelService.deleteChannel(channelId);

      expect(channelRepo.deleteChannel).toHaveBeenCalledWith(channelId);
      expect(result).toEqual(mockDeletedChannel);
    });

    it('should throw an error when the channel does not exist', async () => {
      const channelId = 'mockChannelId';

      channelRepo.deleteChannel.mockResolvedValue(null);

      await expect(channelService.deleteChannel(channelId)).rejects.toThrow(
        CustomError
      );
    });
  });

  describe('getAllChannels', () => {
    it('should get all channels for a server', async () => {
      const serverId = 'mockServerId';
      const mockChannels = [
        { _id: 'channel1', name: 'Channel 1' },
        { _id: 'channel2', name: 'Channel 2' },
      ];

      channelRepo.getAllChannels.mockResolvedValue(mockChannels);

      const result = await channelService.getAllChannels(serverId);

      expect(channelRepo.getAllChannels).toHaveBeenCalledWith(serverId);
      expect(result).toEqual(mockChannels);
    });
  });

  describe('getChannelByChannelId', () => {
    it('should get a channel by serverId and channelId', async () => {
      const serverId = 'mockServerId';
      const channelId = 'mockChannelId';
      const mockChannel = { _id: channelId, name: 'mockChannel' };

      channelRepo.getChannelByChannelId.mockResolvedValue(mockChannel);

      const result = await channelService.getChannelByChannelId(
        serverId,
        channelId
      );

      expect(channelRepo.getChannelByChannelId).toHaveBeenCalledWith(
        serverId,
        channelId
      );
      expect(result).toEqual(mockChannel);
    });
  });
});
