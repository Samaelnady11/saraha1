import ur from "../../DB/repo/user.repo.js";import {
  AuthEnum,
  cacheKeys,
  cacheService,
  myCompare,
  TokenTypeEnum,
} from "../index.js";

import { verifyToken } from "../security/jwt.js";
import {
  asyncHandler,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/exceptions.js";

export const auth = ({ tokenType = TokenTypeEnum.ACCESS } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new BadRequestException("Token not provided");
    }

    const [prefix, token] = authorization.split(" ");

    if (!token) {
      throw new BadRequestException("Token not provided");
    }

    switch (prefix) {
      // ==================== Basic Authentication ====================
      case AuthEnum.Basic: {
        const data = Buffer.from(token, "base64").toString();

        const [email, password] = data.split(":");

        const user = await ur.findOne({
          filter: { email },
        });

        if (!user) {
          throw new NotFoundException("User not found");
        }

        const correctPassword = await myCompare({
          plaintext: password,
          encrypted: user.password,
        });

        if (!correctPassword) {
          throw new UnauthorizedException("Invalid email or password");
        }

        req.user = user;

        return next();
      }

      // ==================== Bearer Authentication ====================
      case AuthEnum.Bearer: {
        let payload;

        try {
          payload = verifyToken({
            token,
            tokenType,
          });
        } catch {
          throw new UnauthorizedException("Invalid or expired token");
        }

        // Validate token payload
        if (
          !payload ||
          typeof payload !== "object" ||
          typeof (payload.sub ?? payload.id) !== "string"
        ) {
          throw new UnauthorizedException("Invalid token payload");
        }

        // Support both sub and id depending on the token payload
        const userId = payload.sub ?? payload.id;

        // Check if token is revoked
        if (payload.jti) {
          const isRevoked = await cacheService.get(
            cacheKeys.userRevokeKey({
              userId,
              jti: payload.jti,
            })
          );

          if (isRevoked) {
            throw new UnauthorizedException("Token is revoked");
          }
        }

        // Get user from database
        const user = await ur.findById({
          id: userId,
        });

        if (!user) {
          throw new NotFoundException("User not found");
        }

        req.user = user;
        req.payload = payload;
        req.auth = payload;

        return next();
      }

      default:
        throw new BadRequestException("Invalid auth method");
    }
  });
};