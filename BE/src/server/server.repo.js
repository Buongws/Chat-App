//server repo
import Server from './server.model.js';

const getServerById = (serverId) => {
  return Server.findOne({ _id: serverId })
    .populate('channels')
};

const createServer = (server) => {
  return Server.create(server);
};

const updateServer = (serverId, server) => {
  return Server.findOneAndUpdate({ _id: serverId }, server, { new: true });
};

const deleteServer = (serverId) => {
  return Server.findOneAndDelete({ _id: serverId });
};

const getAllServers = () => {
  return Server.find();
};

const getServersByUserId = (userId) => {
  //get all server where user is a member of the server, members is an array of user id
  return Server.find({ members: { $in: [userId] } });
};

const getServerByChannelId = (channelId) => {
  return Server.findOne({ channels: { $in: [channelId] } });
}

const getAllMembersByServerId = (serverId) => {
  return Server.findOne({ _id: serverId }).populate('members');
}

export default {
  getServerById,
  createServer,
  updateServer,
  deleteServer,
  getAllServers,
  getServersByUserId,
  getServerByChannelId,
  getAllMembersByServerId
};
