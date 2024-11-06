import express from 'express';
import channelController from './channel.controller.js';
import { verifyToken } from '../../util/auth.js';
import { celebrate, Segments } from 'celebrate';
import {
  channelCreateSchema,
  channelUpdateSchema,
} from '../../util/validation.js';

const router = express.Router();

router.get('/:serverId', verifyToken, channelController.getAllChannels);

router.get('/detail/:id', verifyToken, channelController.getChannelByServerId);

router.post(
  '/',
  verifyToken,
  celebrate({ [Segments.BODY]: channelCreateSchema }),
  channelController.createChannel
);

router.put(
  '/:id',
  verifyToken,
  celebrate({ [Segments.BODY]: channelUpdateSchema }),
  channelController.updateChannel
);

router.delete('/:id', verifyToken, channelController.deleteChannel);

router.get(
  '/:serverId/:channelId',
  verifyToken,
  channelController.getChannelByChannelId
);

export default router;
