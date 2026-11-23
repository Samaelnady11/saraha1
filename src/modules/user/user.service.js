import { UserModel } from '../../DB/model/user.model.js';
import { verifyToken } from '../../common/security/jwt.js';
import { NotFoundException } from "../../common/utils/exceptions.js";
import ur from "../../DB/repo/user.repo.js";

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
export const getUserProfile = async (userId) => {
    let user = await ur.findById({
        id: userId,
        projection: { password: 0, __v: 0, updatedAt: 0, createdAt: 0, role: 0 }
    });
    if (!user) NotFoundException("user not found");
    return user;
};