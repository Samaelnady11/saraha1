import { UserModel } from '../../DB/model/user.model.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../config/config.service.js';
import { ConflictException, UnauthorizedException } from '../../common/utils/exceptions.js';
import { myhash, mycompare } from '../../security/hash.js';
import { myencrypt, mydecrypt } from '../../security/encrypt.js';


export const signup = async (data) => {
  const exists = await UserModel.findOne({ email: data.email });
  if (exists) throw new ConflictException('User already exists');

  const user = await UserModel.create({
    ...data,
    password: await myhash({ plainText: data.password }),
  });

  const result = user.toObject();
  delete result.password;
  return result;
};

export const login = async ({ email, password }) => {
  const user = await UserModel.findOne({ email, deletedAt: null }).select('+password');
  if (!user) throw new UnauthorizedException('Invalid email or password');

  const matchPassword = await mycompare({ plainText: password, encrypted: user.password });
  if (!matchPassword) throw new UnauthorizedException('Invalid email or password');

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  const result = user.toObject();
  delete result.password;
  return { user: result, token };
};