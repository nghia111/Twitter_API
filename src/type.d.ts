import { Request } from "express";
import { User } from "./models/schemas/User.schema";
import { TokenPayload } from "./models/requests/user.request";
declare module 'express' {
    interface Request {
        user?: User,
        decode_authorization?: TokenPayload
        decode_refreshToken?: TokenPayload
        decode_verify_email?: TokenPayload

    }
}