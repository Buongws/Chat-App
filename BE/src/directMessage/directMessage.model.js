//Direct Message Model
import mongoose from 'mongoose';
const { model, models, Schema } = mongoose;

const directMessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const DirectMessage =
  models.DirectMessage || model('DirectMessage', directMessageSchema);

export default DirectMessage;
