
import { config } from 'dotenv';
import { setServers } from 'node:dns';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCipherInfo } from 'node:crypto';

const configDirectory = dirname(fileURLToPath(import.meta.url));
const nodeEnvironment = process.env.NODE_ENV || 'development';

config({
  path: resolve(configDirectory, `../../.env.${nodeEnvironment}`),
  quiet: true,
});

// DNS Configuration
const dnsServers = process.env.DNS_SERVERS
  ?.split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers?.length) {
  setServers(dnsServers);
}

// Environment Variables
const configService = {
  PORT: Number(process.env.PORT || 3000),
  port: Number(process.env.PORT || 3000),

  DB_URI: process.env.DB_URI,

  SALT_ROUNDS: Number(process.env.SALT_ROUNDS || process.env.SALT || 10),
  SALT: Number(process.env.SALT_ROUNDS || process.env.SALT || 10),

  ENC_KEY: process.env.ENC_KEY,
  ENC_IV_LENGTH: Number(process.env.ENC_IV_LENGTH || 12),
  ENC_ALGO: process.env.ENC_ALGO || 'aes-256-gcm',

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_ACCESS_EXP: Number(process.env.JWT_ACCESS_EXP || 30),
  JWT_REFRESH_EXP: Number(process.env.JWT_REFRESH_EXP || 604800),

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
};

// Named Exports
export const PORT = configService.PORT;
export const DB_URI = configService.DB_URI;

export const SALT_ROUNDS = configService.SALT_ROUNDS;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const ENC_KEY = configService.ENC_KEY;
export const JWT_SECRET = configService.JWT_SECRET;
export const JWT_EXPIRES_IN = configService.JWT_EXPIRES_IN;

export const JWT_ACCESS_SECRET = configService.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = configService.JWT_REFRESH_SECRET;

export const JWT_ACCESS_EXP = configService.JWT_ACCESS_EXP;
export const JWT_REFRESH_EXP = configService.JWT_REFRESH_EXP;

// Encryption Validation
export const validateEncryptionConfig = () => {
  if (!configService.ENC_ALGO) {
    throw new Error('ENC_ALGO must be configured');
  }

  const cipherInfo = getCipherInfo(configService.ENC_ALGO);

  if (!cipherInfo) {
    throw new Error('ENC_ALGO must name a supported cipher');
  }

  if (!/^(?:[0-9a-f]{2})+$/i.test(configService.ENC_KEY || '')) {
    throw new Error('ENC_KEY must be a valid hexadecimal key');
  }

  if (
    Buffer.from(configService.ENC_KEY, 'hex').length !== cipherInfo.keyLength
  ) {
    throw new Error('ENC_KEY has an invalid length');
  }

  if (
    !Number.isInteger(configService.ENC_IV_LENGTH) ||
    configService.ENC_IV_LENGTH !== cipherInfo.ivLength
  ) {
    throw new Error('ENC_IV_LENGTH is invalid');
  }
};

// General Config Validation
export const validateConfig = () => {
  if (
    !Number.isInteger(configService.PORT) ||
    configService.PORT < 1 ||
    configService.PORT > 65535
  ) {
    throw new Error('PORT must be between 1 and 65535');
  }

  if (!configService.DB_URI?.trim()) {
    throw new Error('DB_URI must be configured');
  }

  if (
    !Number.isInteger(configService.SALT_ROUNDS) ||
    configService.SALT_ROUNDS < 4 ||
    configService.SALT_ROUNDS > 31
  ) {
    throw new Error('SALT_ROUNDS must be between 4 and 31');
  }

  if (!configService.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET must be configured');
  }

  if (!configService.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET must be configured');
  }

  if (
    !Number.isInteger(configService.JWT_ACCESS_EXP) ||
    configService.JWT_ACCESS_EXP <= 0
  ) {
    throw new Error('JWT_ACCESS_EXP must be positive');
  }

  if (
    !Number.isInteger(configService.JWT_REFRESH_EXP) ||
    configService.JWT_REFRESH_EXP <= 0
  ) {
    throw new Error('JWT_REFRESH_EXP must be positive');
  }

  validateEncryptionConfig();
};

export default configService;
