import bcrypt from 'bcryptjs';

export const myhash = async ({ plainText, saltRounds = 10 }) => {
  return bcrypt.hash(plainText, saltRounds);
};

export const mycompare = async ({ plainText, encrypted }) => {
  return bcrypt.compare(plainText, encrypted);
};