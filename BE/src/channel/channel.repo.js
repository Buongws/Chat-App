import Channel from './channel.model.js';

const getChannelByServerId = (channelId) => {
  return Channel.findOne({ _id: channelId }).populate('server');
};

const getChannelByName = (channelName, serverId) => {
  return Channel.findOne({ channelName: channelName, server: serverId });
};

const createChannel = (channel) => {
  return Channel.create(channel);
};

const updateChannel = (channelId, channelData) => {
  return Channel.findOneAndUpdate({ _id: channelId }, channelData, {
    new: true,
  });
};

const deleteChannel = (channelId) => {
  return Channel.findOneAndDelete({ _id: channelId });
};

const getAllChannels = (serverId) => {
  return Channel.find({ server: serverId });
};

const getChannelByChannelId = (serverId, channelId) => {
  return Channel.findOne({ _id: channelId, server: serverId });
};

export default {
  getChannelByServerId,
  createChannel,
  updateChannel,
  deleteChannel,
  getAllChannels,
  getChannelByName,
  getChannelByChannelId,
};
