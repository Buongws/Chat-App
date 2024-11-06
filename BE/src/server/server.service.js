import serverRepo from './server.repo.js';
import CustomError from '../../util/error.js';
import msg from '../../langs/en.js';
import { getUserInviteToken, verifyInviteToken } from '../../util/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const getServerById = async (serverId) => {
  return await serverRepo.getServerById(serverId);
};

const createServer = async (server) => {
  return await serverRepo.createServer(server);
};

const updateServer = async (serverId, server) => {
  return await serverRepo.updateServer(serverId, server);
};

const deleteServer = async (serverId) => {
  return await serverRepo.deleteServer(serverId);
};

const getAllServers = async () => {
  return await serverRepo.getAllServers();
};

const addChannelToServer = async (serverId, channelId) => {
  const channel = await serverRepo.getServerById(serverId);
  if (!channel) {
    throw new CustomError(
      msg.errorCode.NOT_FOUND,
      msg.responseStatus.NOT_FOUND
    );
  }

  if (!channel.channels.includes(channelId)) {
    channel.channels.push(channelId);
  }
  return await serverRepo.updateServer(serverId, channel);
};

//add new member to server
const addNewMember = async (serverId, memberId) => {
  const server = await serverRepo.getServerById(serverId);
  if (!server) {
    throw new CustomError(
      msg.errorCode.NOT_FOUND,
      msg.responseStatus.NOT_FOUND
    );
  }
  //check if member already exists
  if (!server.members.includes(memberId)) {
    server.members.push(memberId);
  }
  return await serverRepo.updateServer(serverId, server);
};

const removeMember = async (serverId, memberId) => {
  const server = await serverRepo.getServerById(serverId);
  if (!server) {
    throw new CustomError(
      msg.errorCode.NOT_FOUND,
      msg.responseStatus.NOT_FOUND
    );
  }
  if (server.owner.toString() == memberId) {
    throw new CustomError(
      msg.errorCode.ERROR_DELETE_MEMBER,
      msg.responseStatus.BAD_REQUEST
    );
  }
  //check if member exists
  if (!server.members.includes(memberId)) {
    throw new CustomError(
      msg.errorCode.NOT_FOUND,
      msg.responseStatus.NOT_FOUND
    );
  }
  server.members = server.members.filter((member) => member._id != memberId);
  return await serverRepo.updateServer(serverId, server);
};

//generate invite code for server, shorten the token
//update server with invite code
const generateInviteCode = async (serverId) => {
  const inviteCode = getUserInviteToken({ serverId });
  await serverRepo.updateServer(serverId, { inviteCode });
  return inviteCode;
};

//get invite code from server, if the invite code is expired, generate a new one
const getInviteCode = async (serverId) => {
  const server = await serverRepo.getServerById(serverId);
  if (!server.inviteCode) {
    return await generateInviteCode(serverId);
  }
  try {
    const decoded = verifyInviteToken(server.inviteCode);
    const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
    return { inviteCode: server.inviteCode, remainingTime };
  } catch (error) {
    const newInviteCode = await generateInviteCode(serverId);
    return {
      inviteCode: newInviteCode,
      remainingTime: process.env.JWT_INVITE_LIFETIME,
    };
  }
};

const getServersByUserId = async (userId) => {
  const servers = await serverRepo.getServersByUserId(userId);
  const updatedServers = servers.map((server) => {
    const imageUrl = server.imageUrl.replace(/\\/g, '/');
    return {
      ...server._doc,
      imageUrl: `${process.env.CLIENT_URL}/${imageUrl}`,
    };
  });
  return updatedServers;
};

// Join a server using the invite code
const joinServer = async (inviteCode, userId) => {
  try {
    // Verify the invite code (throws an error if invalid or expired)
    const decoded = verifyInviteToken(inviteCode);

    const serverId = decoded.serverId;

    const server = await serverRepo.getServerById(serverId);
    if (!server) {
      throw new CustomError(
        msg.errorCode.NOT_FOUND,
        msg.responseStatus.NOT_FOUND
      );
    }

    // Check if the user is already a member
    if (!server.members.includes(userId)) {
      server.members.push(userId);
      await serverRepo.updateServer(serverId, server);
    }
    return server;
  } catch (error) {
    throw new CustomError(
      msg.errorCode.INVALID_TOKEN,
      msg.responseStatus.BAD_REQUEST
    );
  }
};

const getServerByChannelId = async (channelId) => {
  return await serverRepo.getServerByChannelId(channelId);
};

const getAllMembersByServerId = async (serverId) => {
  return await serverRepo.getAllMembersByServerId(serverId);
};

export default {
  getServerById,
  createServer,
  updateServer,
  deleteServer,
  getAllServers,
  addNewMember,
  removeMember,
  generateInviteCode,
  getServersByUserId,
  getInviteCode,
  joinServer,
  addChannelToServer,
  getServerByChannelId,
  getAllMembersByServerId,
};
