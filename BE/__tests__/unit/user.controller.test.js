import userController from '../../src/user/user.controller.js';
import userService from '../../src/user/user.service.js';
import httpMocks from 'node-mocks-http';
import CustomError from '../../util/error.js';
import fs from 'fs';

jest.mock('../../src/user/user.service.js');
jest.mock('fs');

describe('User Controller - Register', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Testing User Controller', function () {
    describe('User Login', function () {
      it('should return 200 and tokens on successful login', async () => {
        req.body = { email: 'test@example.com', password: 'password123' };

        const mockTokens = {
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken',
        };
        userService.loginUser.mockResolvedValue(mockTokens);

        await userController.login(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({
          statusCode: 200,
          message: 'Success',
          data: mockTokens,
        });
      });

      it('should call next with error when user not found', async () => {
        req.body = { email: 'test@example.com', password: 'password123' };

        const mockError = new CustomError(404, 'User not found');
        userService.loginUser.mockRejectedValue(mockError);

        await userController.login(req, res, next);

        expect(next).toHaveBeenCalledWith(mockError);
      });

      it('should call next with error on incorrect password', async () => {
        req.body = { email: 'test@example.com', password: 'wrongPassword' };

        const mockError = new CustomError(400, 'Incorrect password');
        userService.loginUser.mockRejectedValue(mockError);

        await userController.login(req, res, next);

        expect(next).toHaveBeenCalledWith(mockError);
      });

      it('should call next with error on any other failure', async () => {
        req.body = { email: 'test@example.com', password: 'password123' };

        const mockError = new Error('Internal Server Error');
        userService.loginUser.mockRejectedValue(mockError);

        await userController.login(req, res, next);

        expect(next).toHaveBeenCalledWith(mockError);
      });
    });

    describe('User Register', function () {
      beforeEach(() => {
        req.body = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        };
      });

      it('should register a new user and return success response', async () => {
        userService.registerUser.mockResolvedValue();

        await userController.register(req, res, next);

        expect(userService.registerUser).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          imageUrl: expect.stringMatching(/^uploads\/defaults\/\d\.png$/),
        });
        expect(res.statusCode).toBe(201);
        expect(res._getJSONData()).toEqual({
          statusCode: 201,
          message: 'Successfully!!',
        });
      });

      it('should call next with an error if registration fails', async () => {
        const error = new Error('Registration failed');
        userService.registerUser.mockRejectedValue(error);

        await userController.register(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
      });
    });

    describe('Get New Token', function () {
      it('should return 200 and new tokens on successful token refresh', async () => {
        req.body = { refreshToken: 'mockRefreshToken' };

        const mockNewTokens = {
          accessToken: 'newMockAccessToken',
          refreshToken: 'newMockRefreshToken',
        };
        userService.getNewToken.mockResolvedValue(mockNewTokens);

        await userController.getNewToken(req, res, next);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({
          statusCode: 200,
          message: 'Successfully!!',
          data: mockNewTokens,
        });
      });

      it('should call next with error on token refresh failure', async () => {
        req.body = { refreshToken: 'mockRefreshToken' };

        const mockError = new Error('Token refresh failed');
        userService.getNewToken.mockRejectedValue(mockError);

        await userController.getNewToken(req, res, next);

        expect(next).toHaveBeenCalledWith(mockError);
      });
    });

    describe('Update User', function () {
      it('should update user and return success response', async () => {
        req.user = { userId: 'mockUserId' };
        req.body = { name: 'Updated User', email: 'updated@example.com' };
        req.file = { path: 'uploads/updated.png' };

        const mockUpdatedUser = {
          id: 'mockUserId',
          name: 'Updated User',
          email: 'updated@example.com',
          imageUrl: 'uploads/updated.png',
        };
        userService.updateUser.mockResolvedValue(mockUpdatedUser);

        await userController.updateUser(req, res, next);

        expect(userService.updateUser).toHaveBeenCalledWith('mockUserId', {
          name: 'Updated User',
          email: 'updated@example.com',
          imageUrl: 'uploads/updated.png',
        });
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({
          statusCode: 200,
          message: 'Successfully!!',
          data: mockUpdatedUser,
        });
      });

      it('should call next with error and delete image if update fails', async () => {
        req.user = { userId: 'mockUserId' };
        req.body = { name: 'Updated User', email: 'updated@example.com' };
        req.file = { path: 'uploads/updated.png' };

        const mockError = new Error('Update failed');
        userService.updateUser.mockRejectedValue(mockError);

        await userController.updateUser(req, res, next);

        expect(next).toHaveBeenCalledWith(mockError);
        expect(fs.unlinkSync).toHaveBeenCalledWith('uploads/updated.png');
      });
    });
  });
});
