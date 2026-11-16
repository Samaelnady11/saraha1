
import { OAuth2Client } from 'google-auth-library';

import { UserModel } from '../../DB/model/user.model.js';
import {
  ConflictException,
  UnauthorizedException,
} from '../../common/utils/exceptions.js';

import { myhash, mycompare } from '../../common/security/hash.js';
import { myencrypt, mydecrypt } from '../../common/security/encrypt.js';
import { createTokens, verifyToken } from '../../common/security/jwt.js';

import {
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXP,
  GOOGLE_CLIENT_ID,
} from '../../config/config.service.js';

// Helper functions

const getUserData = (user) => {
  const result = user.toObject();

  delete result.password;

  if (result.phone) {
    result.phone = mydecrypt(result.phone);
  }

  return result;
};

const createAuthResult = (user) => {
  const result = getUserData(user);
  const tokens = createTokens(user);

  return {
    user: result,
    ...tokens,
  };
};

// Signup

export const signup = async (data) => {
  const exists = await UserModel.findOne({ email: data.email });

  if (exists) {
    throw new ConflictException('User already exists');
  }

  const user = await UserModel.create({
    ...data,
    password: await myhash({ plainText: data.password }),
    phone: myencrypt(data.phone),
  });

  return getUserData(user);
};

// Login

export const login = async ({ email, password }) => {
  const user = await UserModel.findOne({
    email,
    deletedAt: null,
  }).select('+password');

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const matchPassword = await mycompare({
    plainText: password,
    encrypted: user.password,
  });

  if (!matchPassword) {
    throw new UnauthorizedException('Invalid email or password');
  }

  return createAuthResult(user);
};

// Google Login

export const googleLogin = async ({ idToken, credential } = {}) => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google login is not configured');
  }

  const submittedToken = idToken || credential;

  if (typeof submittedToken !== 'string' || !submittedToken) {
    throw new Error('Google ID token is required');
  }

  let ticket;

  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    ticket = await client.verifyIdToken({
      idToken: submittedToken,
      audience: GOOGLE_CLIENT_ID,
    });
  } catch {
    throw new UnauthorizedException('Invalid Google ID token');
  }

  const googleUser = ticket.getPayload();

  if (
    !googleUser?.sub ||
    !googleUser.email ||
    googleUser.email_verified !== true
  ) {
    throw new UnauthorizedException('Google account email must be verified');
  }

  const email = googleUser.email.trim().toLowerCase();

  let user = await UserModel.findOne({
    $or: [
      { googleId: googleUser.sub },
      { email },
    ],
    deletedAt: null,
  });

  if (!user) {
    const [givenName, ...familyNames] =
      (googleUser.name || '').trim().split(/\s+/);

    user = await UserModel.create({
      firstName: googleUser.given_name || givenName || 'Google',
      lastName: googleUser.family_name || familyNames.join(' ') || 'User',
      email,
      googleId: googleUser.sub,
    });
  } else if (user.googleId && user.googleId !== googleUser.sub) {
    throw new ConflictException(
      'This email is already linked to another Google account'
    );
  } else if (!user.googleId) {
    user.googleId = googleUser.sub;
    await user.save();
  }

  return createAuthResult(user);
};

// Rotate Token

export const rotateToken = async (token = '') => {
  const refreshToken = token.replace(/^Bearer\s+/i, '').trim();

  let payload;

  try {
    payload = verifyToken({
      token: refreshToken,
      secret: JWT_REFRESH_SECRET,
    });
  } catch {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  const now = Math.floor(Date.now() / 1000);

  if (now < payload.iat + JWT_ACCESS_EXP) {
    throw new ConflictException('access token still valid');
  }

  const user = await UserModel.findOne({
    _id: payload.id,
    deletedAt: null,
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return createTokens(user);
};
