export class AppException extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export class BadRequestException extends AppException {
  constructor(message = 'Bad request') { super(message, 400); }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') { super(message, 401); }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') { super(message, 403); }
}

export class NotFoundException extends AppException {
  constructor(message = 'Not found') { super(message, 404); }
}

export class ConflictException extends AppException {
  constructor(message = 'Conflict') { super(message, 409); }
}

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);