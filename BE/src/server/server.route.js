import express from 'express';
import serverController from './server.controller.js';
import { verifyToken } from '../../util/auth.js';
import upload from '../middlewares/image_upload.middleware.js';

const router = express.Router();

router.get('/', verifyToken, serverController.getAllServers);

router.get('/:id', verifyToken, serverController.getServerById);

router.get('/user/servers', verifyToken, serverController.getServersByUserId);

router.post(
  '/',
  verifyToken,
  upload.single('image'),
  serverController.createServer
);

router.put(
  '/:id',
  verifyToken,
  upload.single('image'),
  serverController.updateServer
);

router.delete('/:id', verifyToken, serverController.deleteServer);

router.post('/add-member/:id', verifyToken, serverController.addNewMember);

router.delete('/remove-member/:id', verifyToken, serverController.removeMember);

router.get('/get-invite-code/:id', verifyToken, serverController.getInviteCode);

router.get(
  '/join-server/:inviteCode',
  verifyToken,
  serverController.joinServer
);

router.get(
  '/get-members/:serverId',
  verifyToken,
  serverController.getAllMembersByServerId
);

export default router;
