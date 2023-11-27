export const enum TokenType {
    AccessToken,
    RefreshToken,
    ForgotpasswordToken,
    EmailVerifyToken
}
export const enum UserVerifyStatus {
    Unverified, // chưa xác thực email, mặc định = 0
    Verified, // đã xác thực email
    Banned // bị khóa
}