import { Router } from "express";
import * as authService from "./auth.service.js";
import { asyncHandler } from "../../common/utils/exceptions.js";

const authController = Router();

// Register
authController.post(
  "/register",
  asyncHandler(async (req, res) => {
    const user = await authService.signup(req.body);

    res.status(201).json({
      message: "user created successfully",
      data: user,
    });
  })
);

// Login
authController.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);

    res.status(200).json({
      message: "login successful",
      data,
    });
  })
);

// Rotate Token
authController.post(
  "/rotate-token",
  asyncHandler(async (req, res) => {
    const tokens = await authService.rotateToken(req.headers.authorization);

    res.status(200).json({
      message: "token rotated",
      data: tokens,
    });
  })
);

// Google Login
authController.post(
  "/google",
  asyncHandler(async (req, res) => {
    const result = await authService.googleLogin(req.body);

    res.status(200).json({
      message: "User logged in successfully",
      data: result.token,
    });
  })
);

// Gmail Login
authController.post(
  "/loginWithGmail",
  asyncHandler(async (req, res) => {
    const { tokens, status } = await authService.loginWithGmail(req.body);

    res.status(status).json({
      message: status === 200 ? "user logged in" : "user created",
      data: tokens,
    });
  })
);

// Logout
authController.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const data = await authService.logout(req.payload);

    res.status(200).json({
      message: "logout successful",
      data,
    });
  })
);

// Confirm Email
authController.post(
  "/confirm-email",
  asyncHandler(async (req, res) => {
    const data = await authService.confirmEmail(req.body);

    res.status(200).json({
      message: "your email is confirmed",
      data,
    });
  })
);

export default authController;