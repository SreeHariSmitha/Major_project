export interface TokenPayload {
    userId: string;
    email: string;
}
export interface DecodedToken extends TokenPayload {
    iat: number;
    exp: number;
}
/**
 * Generate JWT access token (short-lived, 15 minutes)
 */
export declare const generateAccessToken: (payload: TokenPayload) => string;
/**
 * Generate JWT refresh token (long-lived, 7 days)
 */
export declare const generateRefreshToken: (payload: TokenPayload) => string;
/**
 * Generate both access and refresh tokens
 */
export declare const generateTokens: (payload: TokenPayload) => {
    accessToken: string;
    refreshToken: string;
};
/**
 * Verify access token
 */
export declare const verifyAccessToken: (token: string) => DecodedToken;
/**
 * Verify refresh token
 */
export declare const verifyRefreshToken: (token: string) => DecodedToken;
/**
 * Decode token without verification (for debugging)
 */
export declare const decodeToken: (token: string) => DecodedToken | null;
//# sourceMappingURL=jwt.d.ts.map