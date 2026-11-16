
import crypto from 'node:crypto';
import { ENC_KEY } from '../../config/config.service.js';

const key = Buffer.from(ENC_KEY, 'hex');

if (key.length !== 32) {
  throw new Error('ENC_KEY must be 32 bytes for AES-256-GCM');
}

export const myencrypt = (plainText) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const mydecrypt = (data) => {
  const [ivHex, tagHex, encryptedHex] = data.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
};
