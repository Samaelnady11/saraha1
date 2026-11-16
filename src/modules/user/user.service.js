import { UserModel } from '../../DB/model/user.model.js';
import { verifyToken } from '../../common/security/jwt.js';

const clean = (token = '') =>
  token.replace(/^Bearer\s+/i, '').replace(/"/g, '').trim();

export const profile = async (token) => {
  const { id } = verifyToken({ token: clean(token) });
  const user = await UserModel.findById(id);
  return user;
};

export const updateUser = async (token, data) => {
  const { id } = verifyToken({ token: clean(token) });
  const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
  return user;
};