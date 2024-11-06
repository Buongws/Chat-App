import userService from '../../src/user/user.service.js';
import userRepository from '../../src/user/user.repo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CustomError from '../../util/error.js';
import sendEmail from '../../util/email.js';
import msg from '../../langs/en.js';

jest.mock('../../src/user/user.repo.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../util/email.js');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login user and return tokens', async () => {
      const mockUser = { _id: 'mockUserId', password: 'hashedPassword' };
      userRepository.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const result = await userService.loginUser(
        'test@example.com',
        'password'
      );

      expect(result).toEqual({
        accessToken: 'mockToken',
        refreshToken: 'mockToken',
      });
      expect(userRepository.updateUser).toHaveBeenCalledWith(
        mockUser._id,
        expect.any(Object)
      );
    });

    it('should throw error if user does not exist', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);

      await expect(
        userService.loginUser('test@example.com', 'password')
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if password does not match', async () => {
      const mockUser = { _id: 'mockUserId', password: 'hashedPassword' };
      userRepository.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(false);

      await expect(
        userService.loginUser('test@example.com', 'password')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);
      bcrypt.hashSync.mockReturnValue('hashedPassword');

      await userService.registerUser({
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        imageUrl: 'imageUrl',
      });

      expect(userRepository.createUser).toHaveBeenCalledWith(
        expect.any(Object)
      );
    });

    it('should throw error if email already exists', async () => {
      userRepository.getUserByEmail.mockResolvedValue({});

      await expect(
        userService.registerUser({
          name: 'Test',
          email: 'test@example.com',
          password: 'password',
          imageUrl: 'imageUrl',
        })
      ).rejects.toThrow(CustomError);
    });
  });

  describe('getNewToken', () => {
    it('should return new tokens', async () => {
      const mockUser = { _id: 'mockUserId', refreshToken: 'mockToken' };
      jwt.verify.mockReturnValue({ userId: 'mockUserId' });
      userRepository.getUserById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('newMockToken');

      const result = await userService.getNewToken('mockToken');

      expect(result).toEqual({
        accessToken: 'newMockToken',
        refreshToken: 'newMockToken',
      });
      expect(userRepository.updateUser).toHaveBeenCalledWith(
        mockUser._id,
        expect.any(Object)
      );
    });

    it('should throw error if refresh token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new CustomError(400, 'Invalid token');
      });

      await expect(userService.getNewToken('invalidToken')).rejects.toThrow(
        CustomError
      );
    });
  });

  describe('updateUser', () => {
    it('should throw error if user does not exist', async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(
        userService.updateUser('mockUserId', {
          name: 'New Name',
          email: 'new@example.com',
          imageUrl: 'newImageUrl',
        })
      ).rejects.toThrow(CustomError);
    });
  });

  describe('getUserById', () => {
    it('should return user details', async () => {
      const mockUser = {
        _id: 'mockUserId',
        name: 'Test',
        email: 'test@example.com',
        imageUrl: 'imageUrl',
      };
      userRepository.getUserById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('mockUserId');

      expect(result).toEqual({
        userId: 'mockUserId',
        name: 'Test',
        email: 'test@example.com',
        imageUrl: `${process.env.CLIENT_URL}/imageUrl`,
      });
    });

    it('should throw error if user does not exist', async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(userService.getUserById('mockUserId')).rejects.toThrow(
        CustomError
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          _id: 'mockUserId1',
          name: 'Test1',
          email: 'test1@example.com',
          imageUrl: 'imageUrl1',
        },
        {
          _id: 'mockUserId2',
          name: 'Test2',
          email: 'test2@example.com',
          imageUrl: 'imageUrl2',
        },
      ];
      userRepository.getAllUsers.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual([
        {
          userId: 'mockUserId1',
          name: 'Test1',
          email: 'test1@example.com',
          imageUrl: `${process.env.CLIENT_URL}/imageUrl1`,
        },
        {
          userId: 'mockUserId2',
          name: 'Test2',
          email: 'test2@example.com',
          imageUrl: `${process.env.CLIENT_URL}/imageUrl2`,
        },
      ]);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user details by email', async () => {
      const mockUser = {
        _id: 'mockUserId',
        name: 'Test',
        email: 'test@example.com',
        imageUrl: 'imageUrl',
      };
      userRepository.getUserByEmail.mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail('test@example.com');

      expect(result).toEqual({
        userId: 'mockUserId',
        name: 'Test',
        email: 'test@example.com',
        imageUrl: `${process.env.CLIENT_URL}/imageUrl`,
      });
    });

    it('should throw error if user does not exist', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);

      await expect(
        userService.getUserByEmail('test@example.com')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      const mockUser = { _id: 'mockUserId', email: 'test@example.com' };
      userRepository.getUserByEmail.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockResetToken');

      await userService.requestPasswordReset('test@example.com');

      expect(sendEmail).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw error if user does not exist', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);

      await expect(
        userService.requestPasswordReset('test@example.com')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const mockUser = { _id: 'mockUserId', password: 'oldPassword' };
      jwt.verify.mockReturnValue({ userId: 'mockUserId' });
      userRepository.getUserById.mockResolvedValue(mockUser);
      bcrypt.hashSync.mockReturnValue('newHashedPassword');

      await userService.resetPassword('newPassword', 'mockResetToken');

      expect(userRepository.updateUser).toHaveBeenCalledWith(
        mockUser._id,
        expect.any(Object)
      );
    });

    it('should throw error if user does not exist', async () => {
      jwt.verify.mockReturnValue({ userId: 'mockUserId' });
      userRepository.getUserById.mockResolvedValue(null);

      await expect(
        userService.resetPassword('newPassword', 'mockResetToken')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const mockUser = { _id: 'mockUserId', refreshToken: 'mockToken' };
      userRepository.getUserById.mockResolvedValue(mockUser);

      await userService.logout('mockUserId');

      expect(userRepository.updateUser).toHaveBeenCalledWith(
        mockUser._id,
        expect.any(Object)
      );
    });

    it('should throw error if user does not exist', async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(userService.logout('mockUserId')).rejects.toThrow(
        CustomError
      );
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockUser = { _id: 'mockUserId', password: 'oldPassword' };
      userRepository.getUserById.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      bcrypt.hashSync.mockReturnValue('newHashedPassword');

      await userService.updatePassword(
        'mockUserId',
        'oldPassword',
        'newPassword'
      );

      expect(userRepository.updateUser).toHaveBeenCalledWith(
        mockUser._id,
        expect.any(Object)
      );
    });

    it('should throw error if old password does not match', async () => {
      const mockUser = { _id: 'mockUserId', password: 'oldPassword' };
      userRepository.getUserById.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(false);

      await expect(
        userService.updatePassword('mockUserId', 'oldPassword', 'newPassword')
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if user does not exist', async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(
        userService.updatePassword('mockUserId', 'oldPassword', 'newPassword')
      ).rejects.toThrow(CustomError);
    });
  });
});
