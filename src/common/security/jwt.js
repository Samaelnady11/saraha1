import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import configService from "../../config/config.service.js";
import { TokenTypeEnum } from "../enums/tokenType.enum.js";
import { RoleEnum } from "../enums/role.enum.js";

export const createToken = ({
  payload = {},
  options = {},
  secret = configService.JWT_ACCESS_USER_SECRET,
} = {}) => {
  return jwt.sign(payload, secret, options);
};

// ==================== Role Secrets ====================

const getRoleSecret = (role = RoleEnum.user) => {
  switch (role) {
    case RoleEnum.admin:
      return {
        access: configService.JWT_ACCESS_ADMIN_SECRET,
        refresh: configService.JWT_REFRESH_ADMIN_SECRET,
      };

    default:
      return {
        access: configService.JWT_ACCESS_USER_SECRET,
        refresh: configService.JWT_REFRESH_USER_SECRET,
      };
  }
};

const getSecret = ({
  tokenType = TokenTypeEnum.ACCESS,
  role = RoleEnum.user,
} = {}) => {
  const secrets = getRoleSecret(role);

  return tokenType === TokenTypeEnum.REFRESH
    ? secrets.refresh
    : secrets.access;
};

// ==================== Create Tokens ====================

export const createTokens = (data = {}) => {
  const isUserObject = data._id && !("payload" in data);

  const payload = isUserObject
    ? { id: data._id }
    : data.payload || {};

  const role = isUserObject
    ? data.role || RoleEnum.user
    : data.role || RoleEnum.user;

  const options = data.options || {};

  const secrets = getRoleSecret(role);
  const jti = crypto.randomBytes(16).toString("hex");

  const accessToken = createToken({
    payload,
    options: {
      ...options,
      audience: role,
      expiresIn: configService.JWT_ACCESS_EXP,
      jwtid: jti,
    },
    secret: secrets.access,
  });

  const refreshToken = createToken({
    payload,
    options: {
      ...options,
      audience: role,
      expiresIn: configService.JWT_REFRESH_EXP,
      jwtid: jti,
    },
    secret: secrets.refresh,
  });

  return { accessToken, refreshToken };
};

// ==================== Verify Token ====================

export const verifyToken = ({
  token,
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  const audience = decoded.aud;

  const role = Array.isArray(audience)
    ? audience[0]
    : audience;

  if (!role) {
    throw new Error("Token audience is missing");
  }

  const secret = getSecret({
    tokenType,
    role,
  });

  return jwt.verify(token, secret);
};