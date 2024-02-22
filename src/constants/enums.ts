export enum TokenType {
    AccessToken,
    RefreshToken,
    ForgotpasswordToken,
    EmailVerifyToken
}
export enum UserVerifyStatus {
    Unverified, // chưa xác thực email, mặc định = 0
    Verified, // đã xác thực email
    Banned // bị khóa
}

export enum MediaType {
    Image,
    Video
}
export enum TweetType {
    Tweet,
    Retweet,
    Comment,
    QuoteTweet
}
export enum TweetAudience {
    Everyone,
    TwitterCircle
}