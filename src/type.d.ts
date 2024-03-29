import { Request } from "express";
import { User } from "./models/schemas/User.schema";
import { TokenPayload } from "./models/requests/user.request";
import Tweet from "./models/schemas/Tweet.schema";
declare module 'express' {
    interface Request {
        user?: User,
        decode_authorization?: TokenPayload
        decode_refreshToken?: TokenPayload
        decode_verify_email?: TokenPayload
        decode_forgot_password_token?: TokenPayload
        tweet?: Tweet
    }
}