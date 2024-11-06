//server controller
import serverService from './server.service.js';
import msg from '../../langs/en.js';
import response from '../../util/response.js';
import Channel from '../channel/channel.model.js';
import channelService from '../channel/channel.service.js';

const getServerById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const server = await serverService.getServerById(id);
    const customServer = {
      ...server._doc,
      imageUrl: `${process.env.CLIENT_URL}/${server.imageUrl.replace(/\\/g, '/')}`,
    };
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          customServer
        )
      );
  } catch (error) {
    next(error);
  }
};

//create server with user id, if the image is not uploaded, the default image will be used
const createServer = async (req, res, next) => {
  const { serverName } = req.body;
  const owner = req.user.userId;
  const imageUrl = req.file ? req.file.path : undefined;

  const members = [owner];
  try {
    const server = await serverService.createServer({
      serverName,
      owner,
      imageUrl,
      members,
    });

    await channelService.createChannel({
      channelName: 'general text',
      channelType: 'TEXT',
      server: server._id,
    });

    await channelService.createChannel({
      channelName: 'general voice',
      channelType: 'VOICE',
      server: server._id,
    });

    return res
      .status(msg.responseStatus.CREATED)
      .json(
        response(
          msg.responseStatus.CREATED,
          msg.transValidation.INPUT_CORRECT,
          server
        )
      );
  } catch (error) {
    if (imageUrl) {
      fs.unlinkSync(imageUrl);
    }
    next(error);
  }
};

const updateServer = async (req, res, next) => {
  const { id } = req.params;
  const { serverName } = req.body;
  const imageUrl = req.file ? req.file.path : undefined;

  try {
    const updatedServer = await serverService.updateServer(id, {
      serverName,
      imageUrl,
    });
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          updatedServer
        )
      );
  } catch (error) {
    if (imageUrl) {
      fs.unlinkSync(imageUrl);
    }
    next(error);
  }
};

//get invite code for the server
const getInviteCode = async (req, res, next) => {
  const { id } = req.params;
  try {
    const inviteCode = await serverService.getInviteCode(id);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          inviteCode
        )
      );
  } catch (error) {
    next(error);
  }
};

//get all servers by user id
const getServersByUserId = async (req, res, next) => {
  const userId = req.user.userId;

  try {
    const servers = await serverService.getServersByUserId(userId);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          servers
        )
      );
  } catch (error) {
    next(error);
  }
};

const addNewMember = async (req, res, next) => {
  const { id } = req.params;
  const { memberId } = req.body;
  try {
    const server = await serverService.addNewMember(id, memberId);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          server
        )
      );
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  const { id } = req.params;
  const { memberId } = req.body;
  const userId = req.user.userId;
  try {
    const server = await serverService.getServerById(id);
    if (!server) {
      return res
        .status(msg.responseStatus.NOT_FOUND)
        .json(response(msg.responseStatus.NOT_FOUND, msg.errorCode.NOT_FOUND));
    }

    if (server.owner.toString() !== userId) {
      return res
        .status(msg.responseStatus.FORBIDDEN)
        .json(response(msg.responseStatus.FORBIDDEN, msg.errorCode.FORBIDDEN));
    }

    const updatedServer = await serverService.removeMember(id, memberId);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          updatedServer
        )
      );
  } catch (error) {
    next(error);
  }
};

const deleteServer = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    const server = await serverService.getServerById(id);
    if (server.owner.toString() !== userId) {
      return res
        .status(msg.responseStatus.FORBIDDEN)
        .json(response(msg.responseStatus.FORBIDDEN, msg.errorCode.FORBIDDEN));
    }
    await serverService.deleteServer(id);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(msg.responseStatus.SUCCESS, msg.transValidation.INPUT_CORRECT)
      );
  } catch (error) {
    next(error);
  }
};

const getAllServers = async (req, res, next) => {
  try {
    const servers = await serverService.getAllServers();
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          servers
        )
      );
  } catch (error) {
    next(error);
  }
};

const addNewChannel = async (req, res, next) => {
  const { serverId, channelId } = req.body;
  try {
    const server = await serverService.addChannelToServer(serverId, channelId);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          server
        )
      );
  } catch (error) {
    next(error);
  }
};

// Join server using invite code
const joinServer = async (req, res, next) => {
  const { inviteCode } = req.params;
  const userId = req.user.userId;
  try {
    // Pass the inviteCode and userId to the service
    const server = await serverService.joinServer(inviteCode, userId);

    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          server
        )
      );
  } catch (error) {
    next(error);
  }
};

const getAllMembersByServerId = async (req, res, next) => {
  const { serverId } = req.params;

  try {
    const server = await serverService.getAllMembersByServerId(serverId);
    const members = server.members.map((member) => {
      return {
        userId: member._id,
        name: member.name,
        email: member.email,
        imageUrl: `${process.env.CLIENT_URL}/${member.imageUrl.replace(/\\/g, '/')}`,
      };
    });
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          members
        )
      );
  } catch (error) {
    next(error);
  }
};

export default {
  getServerById,
  createServer,
  updateServer,
  deleteServer,
  getAllServers,
  addNewMember,
  removeMember,
  getServersByUserId,
  getInviteCode,
  addNewChannel,
  joinServer,
  getAllMembersByServerId,
};
