import request from 'supertest';
import express from 'express';
import messageRoutes from '../../src/message/message.route.js';
import messageController from '../../src/message/message.controller.js';
import { verifyToken } from '../../util/auth.js';

jest.mock('../../src/message/message.controller.js');
jest.mock('../../util/auth.js');

const app = express();
app.use(express.json());
app.use('/messages', messageRoutes);

describe('Message Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    verifyToken.mockImplementation((req, res, next) => next());
  });

  describe('GET /messages/:channelId', () => {
    it('should get all messages by channel ID', async () => {
      const mockMessages = [{ _id: 'mockMessageId', content: 'Hello World' }];
      messageController.getAllMessageByChannelId.mockImplementation(
        (req, res) => {
          res.status(200).json(mockMessages);
        }
      );

      const res = await request(app)
        .get('/messages/mockChannelId')
        .set('Authorization', 'Bearer mockToken');

      expect(verifyToken).toHaveBeenCalled();
      expect(messageController.getAllMessageByChannelId).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMessages);
    });
  });

  describe('POST /messages/:channelId', () => {
    it('should create a new message', async () => {
      const mockMessage = { _id: 'mockMessageId', content: 'Hello World' };
      messageController.createMessage.mockImplementation((req, res) => {
        res.status(201).json(mockMessage);
      });

      const res = await request(app)
        .post('/messages/mockChannelId')
        .set('Authorization', 'Bearer mockToken')
        .send({ content: 'Hello World' });

      expect(verifyToken).toHaveBeenCalled();
      expect(messageController.createMessage).toHaveBeenCalled();
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockMessage);
    });
  });

  describe('DELETE /messages/:channelId', () => {
    it('should delete a message', async () => {
      messageController.deleteMessage.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Message deleted' });
      });

      const res = await request(app)
        .delete('/messages/mockChannelId')
        .set('Authorization', 'Bearer mockToken');

      expect(verifyToken).toHaveBeenCalled();
      expect(messageController.deleteMessage).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Message deleted' });
    });
  });
});
