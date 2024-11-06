import serverController from '../../src/server/server.controller.js';
import serverService from '../../src/server/server.service.js';
import channelService from '../../src/channel/channel.service.js';
import msg from '../../langs/en.js';
import response from '../../util/response.js';
import fs from 'fs';

jest.mock('../../src/server/server.service.js');
jest.mock('../../src/channel/channel.service.js');
jest.mock('../../langs/en.js');
jest.mock('../../util/response.js');
jest.mock('fs');

describe('Server Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getServerById', () => {
    it('should return server by ID', async () => {
      req.params.id = 'mockServerId';
      const mockServer = { _id: 'mockServerId', imageUrl: 'path\\to\\image' };
      serverService.getServerById.mockResolvedValue(mockServer);

      await serverController.getServerById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          {
            ...mockServer,
            imageUrl: `${process.env.CLIENT_URL}/path/to/image`,
          }
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.getServerById.mockRejectedValue(error);

      await serverController.getServerById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createServer', () => {
    it('should create a new server', async () => {
      req.body.serverName = 'Test Server';
      req.user.userId = 'mockUserId';
      req.file = { path: 'path/to/image' };
      const mockServer = { _id: 'mockServerId' };
      serverService.createServer.mockResolvedValue(mockServer);
      channelService.createChannel.mockResolvedValue(true);

      await serverController.createServer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.CREATED,
          msg.transValidation.INPUT_CORRECT,
          mockServer
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.createServer.mockRejectedValue(error);

      await serverController.createServer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateServer', () => {
    it('should update server details', async () => {
      req.params.id = 'mockServerId';
      req.body.serverName = 'Updated Server';
      req.file = { path: 'path/to/image' };
      const mockServer = { _id: 'mockServerId' };
      serverService.updateServer.mockResolvedValue(mockServer);

      await serverController.updateServer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          mockServer
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.updateServer.mockRejectedValue(error);

      await serverController.updateServer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteServer', () => {
    it('should delete server by ID', async () => {
      req.params.id = 'mockServerId';
      req.user.userId = 'mockUserId';
      const mockServer = { _id: 'mockServerId', owner: 'mockUserId' };
      serverService.getServerById.mockResolvedValue(mockServer);
      serverService.deleteServer.mockResolvedValue(true);

      await serverController.deleteServer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(msg.responseStatus.SUCCESS, msg.transValidation.INPUT_CORRECT)
      );
    });
  });

  describe('getAllServers', () => {
    it('should return all servers', async () => {
      const mockServers = [{ _id: 'server1' }, { _id: 'server2' }];
      serverService.getAllServers.mockResolvedValue(mockServers);

      await serverController.getAllServers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          mockServers
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.getAllServers.mockRejectedValue(error);

      await serverController.getAllServers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addNewMember', () => {
    it('should add new member to server', async () => {
      req.params.id = 'mockServerId';
      req.body.memberId = 'mockMemberId';
      const mockServer = { _id: 'mockServerId' };
      serverService.addNewMember.mockResolvedValue(mockServer);

      await serverController.addNewMember(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          mockServer
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.addNewMember.mockRejectedValue(error);

      await serverController.addNewMember(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeMember', () => {
    it('should remove member from server', async () => {
      req.params.id = 'mockServerId';
      req.body.memberId = 'mockMemberId';
      req.user.userId = 'mockUserId';
      const mockServer = {
        _id: 'mockServerId',
        owner: 'mockUserId',
        members: ['mockMemberId'],
      };
      serverService.getServerById.mockResolvedValue(mockServer);
      serverService.removeMember.mockResolvedValue(mockServer);

      await serverController.removeMember(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          mockServer
        )
      );
    });
  });

  describe('getServersByUserId', () => {
    it('should return servers by user ID', async () => {
      req.user.userId = 'mockUserId';
      const mockServers = [{ _id: 'server1', imageUrl: 'path/to/image' }];
      serverService.getServersByUserId.mockResolvedValue(mockServers);

      await serverController.getServersByUserId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          [
            {
              ...mockServers[0],
              imageUrl: `${process.env.CLIENT_URL}/path/to/image`,
            },
          ]
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.getServersByUserId.mockRejectedValue(error);

      await serverController.getServersByUserId(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getInviteCode', () => {
    it('should return invite code for server', async () => {
      req.params.id = 'mockServerId';
      const mockInviteCode = 'mockInviteCode';
      serverService.getInviteCode.mockResolvedValue(mockInviteCode);

      await serverController.getInviteCode(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          mockInviteCode
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.getInviteCode.mockRejectedValue(error);

      await serverController.getInviteCode(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addNewChannel', () => {
    it('should add new channel to server', async () => {
      req.body.serverId = 'mockServerId';
      req.body.channelId = 'mockChannelId';
      const mockServer = { _id: 'mockServerId' };
      serverService.addChannelToServer.mockResolvedValue(mockServer);

      await serverController.addNewChannel(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          mockServer
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.addChannelToServer.mockRejectedValue(error);

      await serverController.addNewChannel(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('joinServer', () => {
    it('should join server using invite code', async () => {
      req.params.inviteCode = 'mockInviteCode';
      req.user.userId = 'mockUserId';
      const mockServer = { _id: 'mockServerId' };
      serverService.joinServer.mockResolvedValue(mockServer);

      await serverController.joinServer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          mockServer
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.joinServer.mockRejectedValue(error);

      await serverController.joinServer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllMembersByServerId', () => {
    it('should return all members by server ID', async () => {
      req.params.serverId = 'mockServerId';
      const mockServer = {
        _id: 'mockServerId',
        members: [
          {
            _id: 'member1',
            name: 'Member 1',
            email: 'member1@example.com',
            imageUrl: 'path\\to\\image1',
          },
          {
            _id: 'member2',
            name: 'Member 2',
            email: 'member2@example.com',
            imageUrl: 'path\\to\\image2',
          },
        ],
      };
      serverService.getAllMembersByServerId.mockResolvedValue(mockServer);

      await serverController.getAllMembersByServerId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(msg.responseStatus.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          mockServer.members.map((member) => ({
            userId: member._id,
            name: member.name,
            email: member.email,
            imageUrl: `${process.env.CLIENT_URL}/${member.imageUrl.replace(/\\/g, '/')}`,
          }))
        )
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Error');
      serverService.getAllMembersByServerId.mockRejectedValue(error);

      await serverController.getAllMembersByServerId(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
