//Direct Message Route
import express from 'express';
import directMessageController from './directMessage.controller.js';
import { verifyToken } from '../../util/auth.js';

const router = express.Router();

router.post('/send', verifyToken, directMessageController.sendDirectMessage);

router.get(
  '/:recipientId',
  verifyToken,
  directMessageController.getMessagesByConversation
);

export default router;
