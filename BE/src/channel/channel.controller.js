import channelService from './channel.service.js';
import msg from '../../langs/en.js';
import response from '../../util/response.js';
import serverService from '../server/server.service.js';

const getChannelByServerId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const channel = await channelService.getChannelByServerId(id);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.FETCH_SUCCESS,
          channel
        )
      );
  } catch (error) {
    next(error);
  }
};

// Create channel
//Check if the user is the owner of the server, check if the channel name already exists in the server
const createChannel = async (req, res, next) => {
  const { channelName, channelType, serverId } = req.body;
  const { userId } = req.user;
  try {
    const server = await serverService.getServerById(serverId);
    if (server.owner._id.toString() !== userId) {
      return res
        .status(msg.responseStatus.FORBIDDEN)
        .json(response(msg.responseStatus.FORBIDDEN, msg.errorCode.FORBIDDEN));
    }
    const channel = await channelService.createChannel({
      channelName,
      channelType,
      server: serverId,
    });

    await serverService.addChannelToServer(serverId, channel._id);

    return res
      .status(msg.responseStatus.CREATED)
      .json(
        response(
          msg.responseStatus.CREATED,
          msg.transValidation.CREATE_SUCCESS,
          channel
        )
      );
  } catch (error) {
    next(error);
  }
};

const updateChannel = async (req, res, next) => {
  const { id } = req.params;
  const { channelName } = req.body;
  const { userId } = req.user;
  try {
    const server = await serverService.getServerByChannelId(id);

    if (!server) {
      return res
        .status(msg.responseStatus.NOT_FOUND)
        .json(response(msg.responseStatus.NOT_FOUND, 'Server not found'));
    }

    if (server.owner._id.toString() !== userId) {
      return res
        .status(msg.responseStatus.FORBIDDEN)
        .json(response(msg.responseStatus.FORBIDDEN, msg.errorCode.FORBIDDEN));
    }
    const updatedChannel = await channelService.updateChannel(id, {
      channelName,
    });
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.UPDATE_SUCCESS,
          updatedChannel
        )
      );
  } catch (error) {
    next(error);
  }
};

const deleteChannel = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;
  try {
    const server = await serverService.getServerByChannelId(id);

    if (server.owner._id.toString() !== userId) {
      return res
        .status(msg.responseStatus.FORBIDDEN)
        .json(response(msg.responseStatus.FORBIDDEN, msg.errorCode.FORBIDDEN));
    }
    await channelService.deleteChannel(id);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(msg.responseStatus.SUCCESS, msg.transValidation.DELETE_SUCCESS)
      );
  } catch (error) {
    next(error);
  }
};

const getAllChannels = async (req, res, next) => {
  const { serverId } = req.params;
  try {
    const channels = await channelService.getAllChannels(serverId);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.FETCH_SUCCESS,
          channels
        )
      );
  } catch (error) {
    next(error);
  }
};

const getChannelByChannelId = async (req, res, next) => {
  const { serverId, channelId } = req.params;
  try {
    const channel = await channelService.getChannelByChannelId(
      serverId,
      channelId
    );
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.FETCH_SUCCESS,
          channel
        )
      );
  } catch (error) {
    next(error);
  }
};

export default {
  getChannelByServerId,
  createChannel,
  updateChannel,
  deleteChannel,
  getAllChannels,
  getChannelByChannelId,
};
