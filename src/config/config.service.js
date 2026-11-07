import dotenv from 'dotenv';
import path from 'node:path';

const envFilePath = path.resolve(`.env.${process.env.NODE_ENV || 'development'}`);
dotenv.config({ path: envFilePath });

export const PORT = process.env.PORT || 3000;
export const DB_URI = process.env.DB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const ENC_KEY = process.env.ENC_KEY;