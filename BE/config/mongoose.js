import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const URL = process.env.MONGO_URI || 'mongodb://localhost:27017/discord_clone';

console.log(URL);

const connectDB = async () =>
  mongoose
    .connect(URL)
    .then(() => console.log('Connected!'))
    .catch((err) => console.log(err.stack));

export default connectDB;
