import { JwtPayload } from "jsonwebtoken";
import { TokenType, UserVerifyStatus } from "~/constants/enums";

export interface RegisterReqBody {
    username: string,
    name: string,
    email: string,
    password: string,
    confirm_password: string,
    date_of_birth: string
}

export interface UpdateMyProfile {
    name?: string,
    date_of_birth?: string,  // là kiểu Date nhưng người dùng gửi lên sẽ là kiểu iso8601
    bio?: string,
    location?: string,
    website?: string,
    username?: string,
    avatar?: string,
    cover_photo?: string
}
export interface FollowReqBody {
    followed_user_id: string
}

export interface TokenPayload extends JwtPayload {
    user_id: string,
    verify: UserVerifyStatus,
    token_type: TokenType
}