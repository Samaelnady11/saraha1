import { Router } from 'express';
import * as us from './user.service.js';
import { asyncHandler } from '../../common/utils/exceptions.js';

const usercontroller = Router();

usercontroller.get('/profile', asyncHandler(async (req, res) => {
  const user = await us.profile(req.headers.authorization);
  res.status(200).json({ message: 'user logged in', data: user });
}));

usercontroller.patch('/update-user', asyncHandler(async (req, res) => {
  const user = await us.updateUser(req.headers.authorization, req.body);
  res.status(200).json({ message: 'user updated', data: user });
}));

export default usercontroller;