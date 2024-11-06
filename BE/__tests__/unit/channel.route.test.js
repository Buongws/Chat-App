import request from 'supertest';
import express from 'express';
import channelRoutes from '../../src/channel/channel.route.js';
import channelController from '../../src/channel/channel.controller.js';
import { verifyToken } from '../../util/auth.js';
import { celebrate, Segments, Joi } from 'celebrate';

jest.mock('../../src/channel/channel.controller.js');
jest.mock('../../util/auth.js');
jest.mock('celebrate', () => ({
  celebrate: jest.fn((schema) => (req, res, next) => next()),
  Segments: {
    BODY: 'body',
  },
}));

const app = express();
app.use(express.json());
app.use('/channel', channelRoutes);

describe('Channel Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /channel/:serverId', () => {
    it('should call getAllChannels controller', async () => {
      verifyToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'mockUserId' };
        next();
      });
      channelController.getAllChannels.mockImplementation((req, res) =>
        res.status(200).json({ channels: [] })
      );

      const response = await request(app)
        .get('/channel/mockServerId')
        .expect(200);

      expect(verifyToken).toHaveBeenCalled();
      expect(channelController.getAllChannels).toHaveBeenCalled();
      expect(response.body).toEqual({ channels: [] });
    });
  });

  describe('GET /channel/detail/:id', () => {
    it('should call getChannelByServerId controller', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      channelController.getChannelByServerId.mockImplementation((req, res) =>
        res.status(200).json({ channel: {} })
      );

      const response = await request(app)
        .get('/channel/detail/mockChannelId')
        .expect(200);

      expect(verifyToken).toHaveBeenCalled();
      expect(channelController.getChannelByServerId).toHaveBeenCalled();
      expect(response.body).toEqual({ channel: {} });
    });
  });

  describe('POST /channel', () => {
    it('should call createChannel controller', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      celebrate.mockImplementation((schema) => (req, res, next) => next());
      channelController.createChannel.mockImplementation((req, res) =>
        res.status(201).json({ channel: {} })
      );

      const response = await request(app)
        .post('/channel')
        .send({ name: 'New Channel', serverId: 'mockServerId' })
        .expect(201);

      expect(verifyToken).toHaveBeenCalled();
      expect(channelController.createChannel).toHaveBeenCalled();
      expect(response.body).toEqual({ channel: {} });
    });
  });

  describe('PUT /channel/:id', () => {
    it('should call updateChannel controller', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      celebrate.mockImplementation((schema) => (req, res, next) => next());
      channelController.updateChannel.mockImplementation((req, res) =>
        res.status(200).json({ channel: {} })
      );

      const response = await request(app)
        .put('/channel/mockChannelId')
        .send({ name: 'Updated Channel' })
        .expect(200);

      expect(verifyToken).toHaveBeenCalled();
      expect(channelController.updateChannel).toHaveBeenCalled();
      expect(response.body).toEqual({ channel: {} });
    });
  });

  describe('DELETE /channel/:id', () => {
    it('should call deleteChannel controller', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      channelController.deleteChannel.mockImplementation((req, res) =>
        res.status(200).json({ message: 'Channel deleted' })
      );

      const response = await request(app)
        .delete('/channel/mockChannelId')
        .expect(200);

      expect(verifyToken).toHaveBeenCalled();
      expect(channelController.deleteChannel).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Channel deleted' });
    });
  });

  describe('GET /channel/:serverId/:channelId', () => {
    it('should call getChannelByChannelId controller', async () => {
      verifyToken.mockImplementation((req, res, next) => next());
      channelController.getChannelByChannelId.mockImplementation((req, res) =>
        res.status(200).json({ channel: {} })
      );

      const response = await request(app)
        .get('/channel/mockServerId/mockChannelId')
        .expect(200);

      expect(verifyToken).toHaveBeenCalled();
      expect(channelController.getChannelByChannelId).toHaveBeenCalled();
      expect(response.body).toEqual({ channel: {} });
    });
  });
});
