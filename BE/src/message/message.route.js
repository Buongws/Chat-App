import express from 'express';
import messageController from './message.controller.js';
import { verifyToken } from '../../util/auth.js';


//Message Route
const router = express.Router();

router.get(
  '/:channelId',
  verifyToken,
  messageController.getAllMessageByChannelId
);
router.post('/:channelId', verifyToken, messageController.createMessage);
router.delete('/:channelId', verifyToken, messageController.deleteMessage);

export default router;
