import mongoose from 'mongoose';
import { DB_URI } from '../config/config.service.js';
import { client } from "./redis.connection.js";

const connectDB = async () => {
  try {
await mongoose.connect(DB_URI);
        console.log("DB connected");
        await mongoose.syncIndexes();
        await client.connect();
        console.log("redis connected");
    } catch (e) {
        console.log(e.message);
        process.exit(1);
    }
};

export default connectDB;