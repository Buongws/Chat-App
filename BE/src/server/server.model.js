import mongoose from 'mongoose';

const { model, models, Schema } = mongoose;

const serverSchema = new Schema(
  {
    serverName: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: 'uploads/defaults/server-default.jpg',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
      },
    ],
    inviteCode: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Server = models.Server || model('Server', serverSchema);

export default Server;
