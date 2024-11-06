import request from 'supertest';
import express from 'express';
import directMessageRoutes from '../../src/directMessage/directMessage.route.js';
import directMessageController from '../../src/directMessage/directMessage.controller.js';
import { verifyToken } from '../../util/auth.js';

jest.mock('../../src/directMessage/directMessage.controller.js');
jest.mock('../../util/auth.js');

const app = express();
app.use(express.json());
app.use('/directMessage', directMessageRoutes);

describe('Direct Message Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /directMessage/send', () => {
    it('should call sendDirectMessage controller', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      directMessageController.sendDirectMessage.mockImplementation((req, res) =>
        res.status(201).json({ message: 'Message sent' })
      );

      const response = await request(app)
        .post('/directMessage/send')
        .send({ recipientId: 'mockRecipientId', message: 'Hello!' })
        .expect(201);

      expect(verifyToken).toHaveBeenCalled();
      expect(directMessageController.sendDirectMessage).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Message sent' });
    });
  });

  describe('GET /directMessage/:recipientId', () => {
    it('should call getMessagesByConversation controller', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      directMessageController.getMessagesByConversation.mockImplementation(
        (req, res) => res.status(200).json({ messages: [] })
      );

      const response = await request(app)
        .get('/directMessage/mockRecipientId')
        .expect(200);

      expect(verifyToken).toHaveBeenCalled();
      expect(
        directMessageController.getMessagesByConversation
      ).toHaveBeenCalled();
      expect(response.body).toEqual({ messages: [] });
    });
  });
});
