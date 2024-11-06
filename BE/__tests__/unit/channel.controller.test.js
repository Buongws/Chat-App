import httpMocks from 'node-mocks-http';
import channelController from '../../src/channel/channel.controller.js';
import channelService from '../../src/channel/channel.service.js';
import serverService from '../../src/server/server.service.js';
import msg from '../../langs/en.js';
import response from '../../util/response.js';

jest.mock('../../src/channel/channel.service.js');
jest.mock('../../src/server/server.service.js');

let req, res, next;

beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
  jest.clearAllMocks();
});

describe('Channel Controller', () => {
  describe('getChannelByServerId', () => {
    it('should return channels for a server', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/channels/mockServerId',
        params: {
          id: 'mockServerId',
        },
      });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      const mockChannels = [{ _id: 'mockChannelId', name: 'General' }];
      channelService.getChannelByServerId = jest
        .fn()
        .mockResolvedValue(mockChannels);

      await channelController.getChannelByServerId(req, res, next);

      expect(channelService.getChannelByServerId).toHaveBeenCalledWith(
        'mockServerId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.SUCCESS);
      const jsonResponse = res._getJSONData(); // Properly get the JSON response
      expect(jsonResponse).toEqual(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.FETCH_SUCCESS,
          mockChannels
        )
      );
    });

    it('should call next with error if fetching channels fails', async () => {
      req.params.id = 'mockServerId';
      const mockError = new Error('Fetching channels failed');
      channelService.getChannelByServerId.mockRejectedValue(mockError);

      await channelController.getChannelByServerId(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createChannel', () => {
    it('should create a channel if user is the server owner', async () => {
      req.body = {
        channelName: 'General',
        channelType: 'text',
        serverId: 'mockServerId',
      };
      req.user = { userId: 'mockUserId' };
      const mockServer = { owner: { _id: 'mockUserId' } };
      const mockChannel = { _id: 'mockChannelId', name: 'General' };

      serverService.getServerById.mockResolvedValue(mockServer);
      channelService.createChannel.mockResolvedValue(mockChannel);
      serverService.addChannelToServer.mockResolvedValue();

      await channelController.createChannel(req, res, next);

      expect(serverService.getServerById).toHaveBeenCalledWith('mockServerId');
      expect(channelService.createChannel).toHaveBeenCalledWith({
        channelName: 'General',
        channelType: 'text',
        server: 'mockServerId',
      });
      expect(serverService.addChannelToServer).toHaveBeenCalledWith(
        'mockServerId',
        'mockChannelId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.CREATED);
      expect(res._getJSONData()).toEqual(
        response(
          msg.responseStatus.CREATED,
          msg.transValidation.CREATE_SUCCESS,
          mockChannel
        )
      );
    });

    it('should return forbidden if user is not the server owner', async () => {
      req.body = {
        channelName: 'General',
        channelType: 'text',
        serverId: 'mockServerId',
      };
      req.user = { userId: 'mockUserId' };
      const mockServer = { owner: { _id: 'anotherUserId' } };

      serverService.getServerById.mockResolvedValue(mockServer);

      await channelController.createChannel(req, res, next);

      expect(serverService.getServerById).toHaveBeenCalledWith('mockServerId');
      expect(res.statusCode).toBe(msg.responseStatus.FORBIDDEN);
      expect(res._getJSONData()).toEqual(
        response(msg.responseStatus.FORBIDDEN, msg.errorCode.FORBIDDEN)
      );
    });

    it('should call next with error if creating channel fails', async () => {
      req.body = {
        channelName: 'General',
        channelType: 'text',
        serverId: 'mockServerId',
      };
      req.user = { userId: 'mockUserId' };
      const mockError = new Error('Creating channel failed');

      serverService.getServerById.mockRejectedValue(mockError);

      await channelController.createChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateChannel', () => {
    it('should update a channel if user is the server owner', async () => {
      req.params.id = 'mockChannelId';
      req.body = { channelName: 'General' };
      req.user = { userId: 'mockUserId' };
      const mockServer = { owner: { _id: 'mockUserId' } };
      const mockUpdatedChannel = { _id: 'mockChannelId', name: 'General' };

      serverService.getServerByChannelId.mockResolvedValue(mockServer);
      channelService.updateChannel.mockResolvedValue(mockUpdatedChannel);

      await channelController.updateChannel(req, res, next);

      expect(serverService.getServerByChannelId).toHaveBeenCalledWith(
        'mockChannelId'
      );
      expect(channelService.updateChannel).toHaveBeenCalledWith(
        'mockChannelId',
        { channelName: 'General' }
      );
      expect(res.statusCode).toBe(msg.responseStatus.SUCCESS);
      expect(res._getJSONData()).toEqual(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.UPDATE_SUCCESS,
          mockUpdatedChannel
        )
      );
    });

    it('should return forbidden if user is not the server owner', async () => {
      req.params.id = 'mockChannelId';
      req.body = { channelName: 'General' };
      req.user = { userId: 'mockUserId' };
      const mockServer = { owner: { _id: 'anotherUserId' } };

      serverService.getServerByChannelId.mockResolvedValue(mockServer);

      await channelController.updateChannel(req, res, next);

      expect(serverService.getServerByChannelId).toHaveBeenCalledWith(
        'mockChannelId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.FORBIDDEN);
      expect(res._getJSONData()).toEqual(
        response(msg.responseStatus.FORBIDDEN, msg.errorCode.FORBIDDEN)
      );
    });

    it('should call next with error if updating channel fails', async () => {
      req.params.id = 'mockChannelId';
      req.body = { channelName: 'General' };
      req.user = { userId: 'mockUserId' };
      const mockError = new Error('Updating channel failed');

      serverService.getServerByChannelId.mockRejectedValue(mockError);

      await channelController.updateChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteChannel', () => {
    it('should delete a channel if user is the server owner', async () => {
      req.params.id = 'mockChannelId';
      req.user = { userId: 'mockUserId' };
      const mockServer = { owner: { _id: 'mockUserId' } };

      serverService.getServerByChannelId.mockResolvedValue(mockServer);
      channelService.deleteChannel.mockResolvedValue();

      await channelController.deleteChannel(req, res, next);

      expect(serverService.getServerByChannelId).toHaveBeenCalledWith(
        'mockChannelId'
      );
      expect(channelService.deleteChannel).toHaveBeenCalledWith(
        'mockChannelId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.SUCCESS);
      expect(res._getJSONData()).toEqual(
        response(msg.responseStatus.SUCCESS, msg.transValidation.DELETE_SUCCESS)
      );
    });

    it('should return forbidden if user is not the server owner', async () => {
      req.params.id = 'mockChannelId';
      req.user = { userId: 'mockUserId' };
      const mockServer = { owner: { _id: 'anotherUserId' } };

      serverService.getServerByChannelId.mockResolvedValue(mockServer);

      await channelController.deleteChannel(req, res, next);

      expect(serverService.getServerByChannelId).toHaveBeenCalledWith(
        'mockChannelId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.FORBIDDEN);
      expect(res._getJSONData()).toEqual(
        response(msg.responseStatus.FORBIDDEN, msg.errorCode.FORBIDDEN)
      );
    });

    it('should call next with error if deleting channel fails', async () => {
      req.params.id = 'mockChannelId';
      req.user = { userId: 'mockUserId' };
      const mockError = new Error('Deleting channel failed');

      serverService.getServerByChannelId.mockRejectedValue(mockError);

      await channelController.deleteChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getAllChannels', () => {
    it('should return all channels for a server', async () => {
      req.params.serverId = 'mockServerId';
      const mockChannels = [{ _id: 'mockChannelId', name: 'General' }];
      channelService.getAllChannels.mockResolvedValue(mockChannels);

      await channelController.getAllChannels(req, res, next);

      expect(channelService.getAllChannels).toHaveBeenCalledWith(
        'mockServerId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.SUCCESS);
      expect(res._getJSONData()).toEqual(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.FETCH_SUCCESS,
          mockChannels
        )
      );
    });

    it('should call next with error if fetching all channels fails', async () => {
      req.params.serverId = 'mockServerId';
      const mockError = new Error('Fetching all channels failed');
      channelService.getAllChannels.mockRejectedValue(mockError);

      await channelController.getAllChannels(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getChannelByChannelId', () => {
    it('should return a channel by ID', async () => {
      req.params = { serverId: 'mockServerId', channelId: 'mockChannelId' };
      const mockChannel = { _id: 'mockChannelId', name: 'General' };
      channelService.getChannelByChannelId.mockResolvedValue(mockChannel);

      await channelController.getChannelByChannelId(req, res, next);

      expect(channelService.getChannelByChannelId).toHaveBeenCalledWith(
        'mockServerId',
        'mockChannelId'
      );
      expect(res.statusCode).toBe(msg.responseStatus.SUCCESS);
      expect(res._getJSONData()).toEqual(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.FETCH_SUCCESS,
          mockChannel
        )
      );
    });

    it('should call next with error if fetching channel by ID fails', async () => {
      req.params = { serverId: 'mockServerId', channelId: 'mockChannelId' };
      const mockError = new Error('Fetching channel by ID failed');
      channelService.getChannelByChannelId.mockRejectedValue(mockError);

      await channelController.getChannelByChannelId(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
