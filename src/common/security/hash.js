import bcrypt from 'bcrypt';
import argon2 from 'argon2';
import { SALT_ROUNDS } from '../../config/config.service.js';

export const HashEnum = Object.freeze({
  bcrypt: 'bcrypt',
  argon: 'argon',
});

export const myhash = async ({
  plainText,
  minor = 'b',
  lib = HashEnum.bcrypt,
}) => {
  switch (lib) {
    case HashEnum.bcrypt: {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      return bcrypt.hash(plainText, salt);
    }

    case HashEnum.argon:
      return argon2.hash(plainText);

    default:
      throw new Error('Unsupported password hashing algorithm');
  }
};

export const mycompare = async ({
  plainText,
  encrypted,
  lib = HashEnum.bcrypt,
}) => {
  switch (lib) {
    case HashEnum.bcrypt:
      return bcrypt.compare(plainText, encrypted);

    case HashEnum.argon:
      return argon2.verify(encrypted, plainText);

    default:
      throw new Error('Unsupported password hashing algorithm');
  }
};