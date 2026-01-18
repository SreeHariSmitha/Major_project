import jwt from 'jsonwebtoken';
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
/**
 * Generate JWT access token (short-lived, 15 minutes)
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};
/**
 * Generate JWT refresh token (long-lived, 7 days)
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
};
/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (payload) => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
};
/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired access token');
    }
};
/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    }
    catch (error) {
        return null;
    }
};
//# sourceMappingURL=jwt.js.map