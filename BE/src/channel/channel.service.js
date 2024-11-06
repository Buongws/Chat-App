import channelRepo from './channel.repo.js';
import CustomError from '../../util/error.js';
import msg from '../../langs/en.js';

const getChannelByServerId = async (channelId) => {
  const channel = await channelRepo.getChannelByServerId(channelId);
  if (!channel) {
    throw new CustomError(
      msg.errorCode.NOT_FOUND,
      msg.responseStatus.NOT_FOUND
    );
  }
  return channel;
};

const createChannel = async (channel) => {
  const existingChannelByName = await channelRepo.getChannelByName(
    channel.channelName,
    channel.server
  );

  if (existingChannelByName) {
    throw new CustomError(
      msg.errorCode.EXIST_CHANNEL_NAME,
      msg.responseStatus.CONFLICT
    );
  }

  return await channelRepo.createChannel(channel);
};

const updateChannel = async (channelId, channelData) => {
  const existingChannel = await channelRepo.getChannelByServerId(channelId);
  if (!existingChannel) {
    throw new CustomError(
      msg.errorCode.NOT_FOUND,
      msg.responseStatus.NOT_FOUND
    );
  }

  if (
    channelData.channelName &&
    existingChannel.channelName !== channelData.channelName
  ) {
    const existingChannelByName = await channelRepo.getChannelByName(
      channelData.channelName,
      existingChannel.server
    );

    if (
      existingChannelByName &&
      existingChannelByName._id.toString() !== channelId
    ) {
      throw new CustomError(
        msg.errorCode.CONFLICT,
        msg.responseStatus.CONFLICT,
        'Channel name already exists in this server'
      );
    }
  }

  const updatedChannel = await channelRepo.updateChannel(
    channelId,
    channelData
  );
  return updatedChannel;
};  

const deleteChannel = async (channelId) => {
  const deletedChannel = await channelRepo.deleteChannel(channelId);
  if (!deletedChannel) {
    throw new CustomError(
      msg.errorCode.NOT_FOUND,
      msg.responseStatus.NOT_FOUND
    );
  }
  return deletedChannel;
};

const getAllChannels = async (serverId) => {
  return await channelRepo.getAllChannels(serverId);
};

const getChannelByChannelId = async (serverId, channelId) => {
  return await channelRepo.getChannelByChannelId(serverId, channelId);
};

export default {
  getChannelByServerId,
  createChannel,
  updateChannel,
  deleteChannel,
  getAllChannels,
  getChannelByChannelId
};
