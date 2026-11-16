
import { Router } from 'express';
import * as authService from './auth.service.js';
import { asyncHandler } from '../../common/utils/exceptions.js';

const authcontroller = Router();

authcontroller.post('/register', asyncHandler(async (req, res) => {
  const user = await authService.signup(req.body);
  res.status(201).json({ message: 'user created successfully', data: user });
}));

authcontroller.post('/login', asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.status(200).json({ message: 'login successful', data });
}));

authcontroller.post('/rotate-token', asyncHandler(async (req, res) => {
  const tokens = await authService.rotateToken(req.headers.authorization);
  res.status(200).json({ message: 'token rotated', data: tokens });
}));

authcontroller.post('/google', asyncHandler(async (req, res) => {
  const result = await authService.googleLogin(req.body);
  res.status(200).json({
    message: 'User logged in successfully',
    data: result.token,
  });
}));

export default authcontroller;
