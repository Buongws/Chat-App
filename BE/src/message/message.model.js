import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true}
);

const Message = models.Message || model('Message', messageSchema);
export default Message;
