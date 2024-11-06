import mongoose from 'mongoose';
const { model, models, Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
    },
    imageUrl: {
      type: String,
      maxlength: 512,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'OFFLINE'],
      default: 'OFFLINE',
    },
    password: {
      type: String,
      required: true,
      maxlength: 100,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = models.User || model('User', userSchema);

export default User;
