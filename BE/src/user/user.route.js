import express from 'express';
import userController from './user.controller.js';
import upload from '../middlewares/image_upload.middleware.js';
import {
  updateUserPasswordSchema,
  updateUserSchema,
  userSchema,
} from '../../util/validation.js';
import { celebrate, Segments } from 'celebrate';
import { verifyToken } from '../../util/auth.js';

const router = express.Router();

//login
router.post(
  '/login',
  celebrate({ [Segments.BODY]: userSchema }, { abortEarly: false }),
  userController.login
);

router.post(
  '/register',
  celebrate({ [Segments.BODY]: userSchema }),
  userController.register
);

router.post('/refresh-token', userController.getNewToken);

router.put(
  '/update-user/',
  verifyToken,
  upload.single('image'),
  celebrate({ [Segments.BODY]: updateUserSchema }),
  userController.updateUser
);

router.get('/room-users/:roomId', userController.getRoomUsers);

router.get('/', verifyToken, userController.getAllUsers);

router.get('/detail', verifyToken, userController.getUserById);

router.post('/get-user-by-email', verifyToken, userController.getUserByEmail);

router.post('/request-password-reset', userController.requestPasswordReset);

router.post('/reset-password/:resetToken', userController.resetPassword);

router.get('/logout', verifyToken, userController.logout);

router.put(
  '/update-password',
  verifyToken,
  celebrate({ [Segments.BODY]: updateUserPasswordSchema }),
  userController.updatePassword
);

export default router;
