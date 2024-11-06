import userService from './user.service.js';
import response from '../../util/response.js';
import msg from '../../langs/en.js';
import fs from 'fs';

const DEFAULT_IMAGE_URL = 'uploads/defaults/';

// Login function
const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const tokens = await userService.loginUser(email, password);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.LOGIN_SUCCESS,
          tokens
        )
      );
  } catch (error) {
    next(error);
  }
};

// Register function
const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Set default image randomly from folder uploads/default
  const imageUrl = DEFAULT_IMAGE_URL + Math.floor(Math.random() * 5) + '.png';
  try {
    await userService.registerUser({ name, email, password, imageUrl });
    return res
      .status(msg.responseStatus.CREATED)
      .json(
        response(msg.responseStatus.CREATED, msg.transValidation.INPUT_CORRECT)
      );
  } catch (error) {
    next(error);
  }
};

// Refresh access token function
const getNewToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    const newTokens = await userService.getNewToken(refreshToken);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          newTokens
        )
      );
  } catch (error) {
    next(error);
  }
};

// Update user function
const updateUser = async (req, res, next) => {
  const imageUrl = req.file ? req.file.path : null;
  const userId = req.user.userId;
  const { name, email } = req.body;
  try {
    const updatedUser = await userService.updateUser(userId, {
      name,
      email,
      imageUrl,
    });
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          updatedUser
        )
      );
  } catch (error) {
    if (imageUrl) {
      fs.unlinkSync(imageUrl); // Delete image if an error occurs
    }
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;
  try {
    await userService.updatePassword(userId, oldPassword, newPassword);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(msg.responseStatus.SUCCESS, msg.transValidation.INPUT_CORRECT)
      );
  } catch (error) {
    next(error);
  }
};

// Get all users function
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          users
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get user by ID function
const getUserById = async (req, res, next) => {
  const id = req.user.userId;
  try {
    const user = await userService.getUserById(id);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          user
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get user by email function
const getUserByEmail = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await userService.getUserByEmail(email);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(
          msg.responseStatus.SUCCESS,
          msg.transValidation.INPUT_CORRECT,
          user
        )
      );
  } catch (error) {
    next(error);
  }
};

//Request password reset function
const requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  try {
    await userService.requestPasswordReset(email);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(msg.responseStatus.SUCCESS, msg.transValidation.INPUT_CORRECT)
      );
  } catch (error) {
    next(error);
  }
};

//Reset password function
const resetPassword = async (req, res, next) => {
  const { password } = req.body;
  const { resetToken } = req.params;
  try {
    await userService.resetPassword(password, resetToken);
    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(msg.responseStatus.SUCCESS, msg.transValidation.INPUT_CORRECT)
      );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  const userId = req.user.userId;
  console.log(userId);

  try {
    await userService.logout(userId);

    return res
      .status(msg.responseStatus.SUCCESS)
      .json(
        response(msg.responseStatus.SUCCESS, msg.transValidation.INPUT_CORRECT)
      );
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  register,
  getNewToken,
  updateUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  requestPasswordReset,
  resetPassword,
  logout,
  updatePassword,
};
