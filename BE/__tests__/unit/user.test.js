import httpMocks from 'node-mocks-http';
import User from '../../src/user/user.model.js';
import userService from '../../src/user/user.service.js';
import userController from '../../src/user/user.controller.js';
import CustomError from '../../util/error.js';

User.findOne = jest.fn();

jest.mock('../../src/user/user.service.js');

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
});
