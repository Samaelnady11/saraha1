import { verifyToken } from '../security/jwt.js';
import { UnauthorizedException, asyncHandler } from '../utils/exceptions.js';
import { UserModel } from '../../DB/model/user.model.js';
import { TokenType } from '../enums/token-type.enum.js';
import { exceptions } from "../utils/exceptions.js"
import { verifyToken } from "../security/index.js"

export const authentication = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new UnauthorizedException('Token is required');

  let payload;
  try {
    payload = verifyToken({ token });
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }

  const user = await UserModel.findOne({ _id: payload.id, deletedAt: null });
  if (!user) throw new UnauthorizedException('User not found');

  req.user = user;
  next();
});
export const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization
  const match =
    typeof authorization === "string" &&
    authorization.match(/^Bearer\s+(\S+)$/i)

  if (!match) {
    exceptions.unauthorized("A Bearer token is required")
  }

  let payload
  try {
    payload = verifyToken({ token: match[1] })
  } catch {
    exceptions.unauthorized("Invalid or expired token")
  }

  if (!payload || typeof payload !== "object" || typeof payload.sub !== "string") {
    exceptions.unauthorized("Invalid token payload")
  }

  req.auth = payload
  next()
}