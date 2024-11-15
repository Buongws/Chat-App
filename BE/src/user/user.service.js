import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from './user.repo.js';
import {
  getResetToken,
  getUserAccessToken,
  getUserRefreshToken,
} from '../../util/auth.js';
import msg from '../../langs/en.js';
import CustomError from '../../util/error.js';
import sendEmail from '../../util/email.js';
import dotenv from 'dotenv';
dotenv.config();

// Login service
const loginUser = async (email, password) => {
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }
  const isMatch = bcrypt.compareSync(
    password.toString(),
    user.password.toString()
  );

  if (!isMatch) {
    throw new CustomError(
      msg.errorCode.LOGIN_FAIL,
      msg.responseStatus.BAD_REQUEST
    );
  }

  const accessToken = getUserAccessToken({ userId: user._id });
  const refreshToken = getUserRefreshToken({ userId: user._id });

  // Store refreshToken in the database
  user.refreshToken = refreshToken;
  await userRepository.updateUser(user._id, user);

  return {
    accessToken,
    refreshToken,
  };
};

// Register service
const registerUser = async ({ name, email, password, imageUrl }) => {
  const user = await userRepository.getUserByEmail(email);
  if (user) {
    throw new CustomError(
      msg.errorCode.EMAIL_EXIST,
      msg.responseStatus.BAD_REQUEST
    );
  }
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);
  const newUser = {
    name,
    email,
    password: hashPassword,
    imageUrl,
  };
  await userRepository.createUser(newUser);
};
// Refresh token service
const getNewToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new CustomError(
      msg.errorCode.INVALID_TOKEN,
      msg.responseStatus.BAD_REQUEST
    );
  }

  const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  if (!user) {
    throw new CustomError(
      msg.errorCode.INVALID_TOKEN,
      msg.responseStatus.BAD_REQUEST
    );
  }
  //check the refresh token in the database
  const userInDb = await userRepository.getUserById(user.userId);
  if (!userInDb || userInDb.refreshToken !== refreshToken) {
    throw new CustomError(
      msg.errorCode.INVALID_TOKEN,
      msg.responseStatus.BAD_REQUEST
    );
  }
  const newAccessToken = getUserAccessToken({ userId: userInDb._id });
  const newRefreshToken = getUserRefreshToken({ userId: userInDb._id });
  //update the refresh token in the database
  userInDb.refreshToken = newRefreshToken;
  await userRepository.updateUser(userInDb._id, userInDb);
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const updateUser = async (userId, { name, email, imageUrl }) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }
  if (name) user.name = name;
  if (email) user.email = email;
  if (imageUrl) user.imageUrl = imageUrl;
  //Store image on server
  const updatedUser = await userRepository.updateUser(userId, user);
  if (!updatedUser) {
    throw new CustomError(
      msg.errorCode.UPDATE_USER_FAIL,
      msg.responseStatus.BAD_REQUEST
    );
  }
  return {
    userId: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    imageUrl: `${process.env.CLIENT_URL}/${updatedUser.imageUrl}`,
    status: updatedUser.status,
  };
};

const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }
  const isMatch = bcrypt.compareSync(oldPassword, user.password);
  if (!isMatch) {
    throw new CustomError(
      msg.errorCode.WRONG_PASSWORD,
      msg.responseStatus.BAD_REQUEST
    );
  }
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(newPassword, salt);
  user.password = hashPassword;
  return userRepository.updateUser(userId, user);
};

const getUserById = async (userId) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }
  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    imageUrl: `${process.env.CLIENT_URL}/${user.imageUrl.replace(/\\/g, '/')}`,
  };
};

const getAllUsers = async () => {
  const users = await userRepository.getAllUsers();
  return users.map((user) => ({
    userId: user._id,
    name: user.name,
    email: user.email,
    imageUrl: `${process.env.CLIENT_URL}/${user.imageUrl.replace(/\\/g, '/')}`,
  }));
};

const getUserByEmail = async (email) => {
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }
  const customUser = {
    userId: user._id,
    name: user.name,
    email: user.email,
    imageUrl: `${process.env.CLIENT_URL}/${user.imageUrl.replace(/\\/g, '/')}`,
  };

  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }
  return customUser;
};

// Request reset password
const requestPasswordReset = async (email) => {
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }

  //generate a reset token including user id
  const resetToken = getResetToken({ userId: user._id });
  const formattedResetToken = resetToken.replace(/\./g, '@@');

  //Send email to user with reset token
  const resetUrl = `${process.env.FRONTEND_URL}/user/reset-password/${formattedResetToken}`;
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    text: `To reset your password, please click on this link: ${resetUrl}`,
  });
};

//logout service
const logout = async (userId) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }
  user.refreshToken = '';
  return userRepository.updateUser(userId, user);
};

// Reset password service
const resetPassword = async (newPassword, resetToken) => {
  // Check if the reset token is valid
  const token = jwt.verify(resetToken, process.env.JWT_RESET_SECRET);
  const userId = token.userId;

  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new CustomError(
      msg.errorCode.USER_NOT_EXIST,
      msg.responseStatus.NOT_FOUND
    );
  }

  // Hash new password
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(newPassword, salt);
  user.password = hashPassword;
  user.refreshToken = '';

  user.resetToken = null;
  return await userRepository.updateUser(userId, user);
};

export default {
  loginUser,
  registerUser,
  getNewToken,
  updateUser,
  getUserById,
  getAllUsers,
  getUserByEmail,
  requestPasswordReset,
  resetPassword,
  logout,
  updatePassword,
};
