
import {
    cacheKeys,
    cacheService,
    createTokens,
    emailEvents,
    EmailEventsEnum,
    exceptions,
    HashEnum,
    myCompare,
    myHash,
    ProviderEnum
} from "../../common/index.js";

import { encryption } from "../../common/security/encrypt.js";
import { mydecrypt } from "../../common/security/encrypt.js";
import configService from "../../config/config.service.js";
import ur from "../../DB/repo/user.repo.js";
import { OAuth2Client } from "google-auth-library";
import { verifyToken } from "../../common/security/jwt.js";

const client = new OAuth2Client(configService.GOOGLE_CLIENT_ID);

// Helper
const getUserData = (user) => {
    const result = user.toObject ? user.toObject() : { ...user };

    delete result.password;

    if (result.phone) {
        result.phone = mydecrypt(result.phone);
    }

    return result;
};

// Signup
export const signup = async (data) => {
    const exists = await ur.findOne({
        filter: { email: data.email },
        projection: { email: 1 }
    });

    if (exists) exceptions.ConflictException("user already exists");

    const { confirmPassword, ...userData } = data;

    userData.password = await myHash({
        plaintext: userData.password,
        lib: HashEnum.argon
    });

    userData.phone = encryption(userData.phone);

    const user = await ur.create({ data: userData });

    const otp = Math.trunc(Math.random() * 10000)
        .toString()
        .padStart(4, "5");

    await cacheService.set({
        key: cacheKeys.userOtpKey({ userId: user._id.toString() }),
        value: otp,
        ttl: 600
    });

    emailEvents.emit(EmailEventsEnum.signup, {
        receivers: { to: user.email },
        otp
    });

    return getUserData(user);
};

// Login
export const login = async ({ email, password }) => {
    const user = await ur.findOne({
        filter: { email },
        projection: {
            email: 1,
            password: 1,
            role: 1,
            confirmEmail: 1,
            phone: 1,
            userName: 1
        },
        options: { lean: true }
    });

    if (!user) exceptions.NotFoundException("user not found");

    if (!user.confirmEmail) {
        exceptions.ForbiddenException("user not confirmed");
    }

    const matchPassword = await myCompare({
        plaintext: password,
        encrypted: user.password,
        lib: HashEnum.argon
    });

    if (!matchPassword) exceptions.NotFoundException("user not found");

    return createTokens({
        options: {
            subject: user.id || user._id.toString(),
            issuer: "ali",
            audience: [user.role]
        },
        role: user.role
    });
};

// Google Login
export const loginWithGmail = async (data) => {
    let ticket;

    try {
        ticket = await client.verifyIdToken({
            idToken: data.idToken,
            audience: configService.GOOGLE_CLIENT_ID
        });
    } catch {
        exceptions.UnauthorizedException("Invalid Google ID token");
    }

    const payload = ticket.getPayload();

    if (
        !payload?.sub ||
        !payload.email ||
        payload.email_verified !== true
    ) {
        exceptions.UnauthorizedException("this email is not verified");
    }

    const email = payload.email.trim().toLowerCase();

    let user = await ur.findOne({
        filter: { email }
    });

    let status = 200;

    if (!user) {
        user = await ur.create({
            data: {
                email,
                image: payload.picture,
                userName: payload.name,
                googleId: payload.sub,
                provider: ProviderEnum.google,
                confirmEmail: new Date()
            }
        });

        status = 201;
    }

    return {
        tokens: createTokens({
            options: {
                subject: user.id || user._id.toString(),
                issuer: "ali",
                audience: [user.role]
            },
            role: user.role
        }),
        status
    };
};

// Rotate Token
export const rotateToken = async (user, payload) => {
    const accessIAT = payload.iat * 1000;
    const accessExpIn = configService.JWT_ACCESS_EXP * 1000;
    const accessExpAt = accessIAT + accessExpIn;

    if (Date.now() < accessExpAt) {
        exceptions.ConflictException("access token still valid");
    }

    const tokens = createTokens({
        options: {
            subject: user.id || user._id.toString(),
            issuer: "ali",
            audience: [user.role]
        },
        role: user.role
    });

    return tokens;
};

// Logout
export const logout = async (payload) => {
    const { exp, jti, sub } = payload;

    const nowInSec = Math.ceil(Date.now() / 1000);
    const ttl = exp - nowInSec;

    if (ttl > 0) {
        await cacheService.set({
            key: cacheKeys.userRevokeKey({ userId: sub, jti }),
            value: jti,
            ttl
        });
    }

    return { ...payload, nowInSec, ttl };
};

// Confirm Email
export const confirmEmail = async ({ email, otp }) => {
    const user = await ur.findOne({ filter: { email } });

    if (!user) exceptions.NotFoundException("user not found");

    const storedOtp = await cacheService.get(
        cacheKeys.userOtpKey({ userId: user._id.toString() })
    );

    if (otp !== storedOtp) {
        exceptions.BadRequestException("wrong otp");
    }

    user.confirmEmail = new Date();
    await user.save();

    await cacheService.del([
        cacheKeys.userOtpKey({ userId: user._id.toString() })
    ]);
};
