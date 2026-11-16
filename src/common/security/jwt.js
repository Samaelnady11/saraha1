
import jwt from 'jsonwebtoken';
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXP,
  JWT_REFRESH_EXP,
} from '../../config/config.service.js';

export const createToken = ({
  payload = {},
  options = {},
  secret = JWT_ACCESS_SECRET,
} = {}) => {
  console.log('Inside createToken:', {
    secretExists: !!secret,
    secretType: typeof secret,
    secretLength: secret?.length,
  });

  return jwt.sign(payload, secret, options);
};

export const verifyToken = ({
  token,
  secret = JWT_ACCESS_SECRET,
} = {}) => {
  return jwt.verify(token, secret);
};

export const createTokens = (user) => {
  console.log('Creating access token');

  const accessToken = createToken({
    payload: { id: user._id },
    secret: JWT_ACCESS_SECRET,
    options: { expiresIn: JWT_ACCESS_EXP },
  });

  console.log('Access token created');

  const refreshToken = createToken({
    payload: { id: user._id },
    secret: JWT_REFRESH_SECRET,
    options: { expiresIn: JWT_REFRESH_EXP },
  });

  console.log('Refresh token created');

  return { accessToken, refreshToken };
};
