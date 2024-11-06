import serverService from '../../src/server/server.service.js';
import serverRepo from '../../src/server/server.repo.js';
import CustomError from '../../util/error.js';
import msg from '../../langs/en.js';
import { getUserInviteToken, verifyInviteToken } from '../../util/auth.js';

jest.mock('../../src/server/server.repo.js');
jest.mock('../../util/error.js');
jest.mock('../../langs/en.js');
jest.mock('../../util/auth.js');

describe('Server Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getServerById', () => {
    it('should return server by ID', async () => {
      const mockServer = { _id: 'mockServerId' };
      serverRepo.getServerById.mockResolvedValue(mockServer);

      const result = await serverService.getServerById('mockServerId');

      expect(result).toEqual(mockServer);
      expect(serverRepo.getServerById).toHaveBeenCalledWith('mockServerId');
    });
  });

  describe('createServer', () => {
    it('should create a new server', async () => {
      const mockServer = { name: 'Test Server' };
      serverRepo.createServer.mockResolvedValue(mockServer);

      const result = await serverService.createServer(mockServer);

      expect(result).toEqual(mockServer);
      expect(serverRepo.createServer).toHaveBeenCalledWith(mockServer);
    });
  });

  describe('updateServer', () => {
    it('should update server details', async () => {
      const mockServer = { _id: 'mockServerId', name: 'Updated Server' };
      serverRepo.updateServer.mockResolvedValue(mockServer);

      const result = await serverService.updateServer(
        'mockServerId',
        mockServer
      );

      expect(result).toEqual(mockServer);
      expect(serverRepo.updateServer).toHaveBeenCalledWith(
        'mockServerId',
        mockServer
      );
    });
  });

  describe('deleteServer', () => {
    it('should delete server by ID', async () => {
      serverRepo.deleteServer.mockResolvedValue(true);

      const result = await serverService.deleteServer('mockServerId');

      expect(result).toBe(true);
      expect(serverRepo.deleteServer).toHaveBeenCalledWith('mockServerId');
    });
  });

  describe('getAllServers', () => {
    it('should return all servers', async () => {
      const mockServers = [{ _id: 'server1' }, { _id: 'server2' }];
      serverRepo.getAllServers.mockResolvedValue(mockServers);

      const result = await serverService.getAllServers();

      expect(result).toEqual(mockServers);
      expect(serverRepo.getAllServers).toHaveBeenCalled();
    });
  });

  describe('addChannelToServer', () => {
    it('should add channel to server', async () => {
      const mockServer = { _id: 'mockServerId', channels: [] };
      serverRepo.getServerById.mockResolvedValue(mockServer);
      serverRepo.updateServer.mockResolvedValue(mockServer);

      const result = await serverService.addChannelToServer(
        'mockServerId',
        'mockChannelId'
      );

      expect(result).toEqual(mockServer);
      expect(serverRepo.getServerById).toHaveBeenCalledWith('mockServerId');
      expect(serverRepo.updateServer).toHaveBeenCalledWith(
        'mockServerId',
        mockServer
      );
    });
  });

  describe('addNewMember', () => {
    it('should add new member to server', async () => {
      const mockServer = { _id: 'mockServerId', members: [] };
      serverRepo.getServerById.mockResolvedValue(mockServer);
      serverRepo.updateServer.mockResolvedValue(mockServer);

      const result = await serverService.addNewMember(
        'mockServerId',
        'mockMemberId'
      );

      expect(result).toEqual(mockServer);
      expect(serverRepo.getServerById).toHaveBeenCalledWith('mockServerId');
      expect(serverRepo.updateServer).toHaveBeenCalledWith(
        'mockServerId',
        mockServer
      );
    });
  });

  describe('generateInviteCode', () => {
    it('should generate invite code for server', async () => {
      const mockInviteCode = 'mockInviteCode';
      getUserInviteToken.mockReturnValue(mockInviteCode);
      serverRepo.updateServer.mockResolvedValue(true);

      const result = await serverService.generateInviteCode('mockServerId');

      expect(result).toEqual(mockInviteCode);
      expect(getUserInviteToken).toHaveBeenCalledWith({
        serverId: 'mockServerId',
      });
      expect(serverRepo.updateServer).toHaveBeenCalledWith('mockServerId', {
        inviteCode: mockInviteCode,
      });
    });
  });

  describe('getInviteCode', () => {
    it('should return existing invite code', async () => {
      const mockServer = { _id: 'mockServerId', inviteCode: 'mockInviteCode' };
      serverRepo.getServerById.mockResolvedValue(mockServer);
      verifyInviteToken.mockReturnValue(true);

      const result = await serverService.getInviteCode('mockServerId');

      expect(result).toEqual({"inviteCode": "mockInviteCode", "remainingTime": NaN});
      expect(serverRepo.getServerById).toHaveBeenCalledWith('mockServerId');
      expect(verifyInviteToken).toHaveBeenCalledWith('mockInviteCode');
    });

  });

  describe('joinServer', () => {
    it('should join server using invite code', async () => {
      const mockServer = { _id: 'mockServerId', members: [] };
      const mockDecoded = { serverId: 'mockServerId' };
      verifyInviteToken.mockReturnValue(mockDecoded);
      serverRepo.getServerById.mockResolvedValue(mockServer);
      serverRepo.updateServer.mockResolvedValue(mockServer);

      const result = await serverService.joinServer(
        'mockInviteCode',
        'mockUserId'
      );

      expect(result).toEqual(mockServer);
      expect(verifyInviteToken).toHaveBeenCalledWith('mockInviteCode');
      expect(serverRepo.getServerById).toHaveBeenCalledWith('mockServerId');
      expect(serverRepo.updateServer).toHaveBeenCalledWith(
        'mockServerId',
        mockServer
      );
    });
  });

  describe('getServerByChannelId', () => {
    it('should return server by channel ID', async () => {
      const mockServer = { _id: 'mockServerId' };
      serverRepo.getServerByChannelId.mockResolvedValue(mockServer);

      const result = await serverService.getServerByChannelId('mockChannelId');

      expect(result).toEqual(mockServer);
      expect(serverRepo.getServerByChannelId).toHaveBeenCalledWith(
        'mockChannelId'
      );
    });
  });

  describe('getAllMembersByServerId', () => {
    it('should return all members by server ID', async () => {
      const mockMembers = [{ _id: 'member1' }, { _id: 'member2' }];
      serverRepo.getAllMembersByServerId.mockResolvedValue(mockMembers);

      const result =
        await serverService.getAllMembersByServerId('mockServerId');

      expect(result).toEqual(mockMembers);
      expect(serverRepo.getAllMembersByServerId).toHaveBeenCalledWith(
        'mockServerId'
      );
    });
  });
});
