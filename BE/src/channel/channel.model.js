//channel model
import mongoose from 'mongoose';

const { model, models, Schema } = mongoose;

const channelSchema = new Schema({
  channelName: {
    type: String,
    required: true,
  },
  channelType: {
    type: String,
    enum: ['TEXT', 'VOICE'],
    default: 'TEXT',
  },
  server: {
    type: Schema.Types.ObjectId,
    ref: 'Server',
  },
  messages: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
});

const Channel = models.Channel || model('Channel', channelSchema);

export default Channel;
