//Conversation Model

import mongoose from 'mongoose';
const { model, models, Schema } = mongoose;

const conversationSchema = new Schema(
  {
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const Conversation =
  models.Conversation || model('Conversation', conversationSchema);

export default Conversation;
