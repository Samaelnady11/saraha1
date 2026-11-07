import crypto from 'crypto';
import { ENC_KEY } from '../config/config.service.js';

const key = Buffer.from(ENC_KEY, 'hex');

export const myencrypt = (plainText) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const mydecrypt = (data) => {
  const [iv, tag, encrypted] = data.split(':').map((p) => Buffer.from(p, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
};