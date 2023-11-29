import { User } from "~/models/schemas/User.schema";
import { databaseService } from "./database.service";
import { RegisterReqBody } from "~/models/requests/user.request";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import { ObjectId } from "mongodb";
import { RefreshToken } from "~/models/schemas/RefreshToken.schema";
import { userMessage } from "~/constants/message";


class UserService {

    private signAccessToken(user_id: string) {
        const payload = {
            user_id,
            token_type: TokenType.AccessToken
        }
        return signToken(payload, process.env.JWT_SECRET_ACCESS_TOKEN as string, process.env.ACCESS_TOKEN_EXPIRES_IN as string)
    }
    private signRefreshToken(user_id: string) {
        const payload = {
            user_id,
            token_type: TokenType.RefreshToken
        }
        return signToken(payload, process.env.JWT_SECRET_REFRESH_TOKEN as string, process.env.REFRESH_TOKEN_EXPIRES_IN as string)
    }
    private signAccessTokenAndRefreshToken(userid: string) {
        return Promise.all([
            this.signAccessToken(userid),
            this.signRefreshToken(userid)
        ])
    }
    private signEmailVerifyToken(user_id: string) {
        const payload = {
            user_id,
            token_type: TokenType.EmailVerifyToken
        }
        return signToken(payload, process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string, process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string)
    }
    async login(userid: string) {
        const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken(userid)
        await databaseService.getRefreshTokenCollection().insertOne(new RefreshToken({ user_id: new ObjectId(userid), token: refreshToken }))

        return {
            accessToken,
            refreshToken
        }
    }


    async register(payload: RegisterReqBody) {
        const userid = new ObjectId()
        const emailVerifyToken = this.signEmailVerifyToken(userid.toString())
        await databaseService.getUsersCollection().insertOne(new User({
            _id: userid,
            email_verify_token: emailVerifyToken,
            ...payload,
            date_of_birth: new Date(payload.date_of_birth),
            password: hashPassword(payload.password)
        }))
        const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken(userid.toString())
        await databaseService.getRefreshTokenCollection().insertOne(new RefreshToken({ user_id: userid, token: refreshToken }))
        return {
            accessToken,
            refreshToken
        }
    }
    async logout(refreshToken: string) {
        // console.log(refreshToken)
        const response = await databaseService.getRefreshTokenCollection().deleteOne({ token: refreshToken })
        return response
    }
    async verifyEmail(userid: string) {
        // console.log(refreshToken)
        const [tokens] = await Promise.all([
            this.signAccessTokenAndRefreshToken(userid),
            databaseService.getUsersCollection().updateOne({ _id: new ObjectId(userid) },
                {
                    $set: {
                        verify: UserVerifyStatus.Verified,
                        email_verify_token: '',
                        /*( tính theo thời gian tạo giá trị
                         updated_at: new Date()   )*/
                    },
                    //tính theo thời gian cập nhật dữ liệu lên db
                    $currentDate: {
                        updated_at: true
                    }
                })
        ])
        const [accessToken, refreshToken] = tokens
        return {
            accessToken,
            refreshToken
        }
    }
    async resendVerifyEmail(userId: string) {
        const emailVerifyToken = this.signEmailVerifyToken(userId)
        // giả bộ gửi email về user
        console.log('gửi này về email của người dùng: ', emailVerifyToken)
        // cập nhật giá trị emailVerifyToken lại databaseService
        await databaseService.getUsersCollection().updateOne({ _id: new ObjectId(userId) }, {
            $set: {
                email_verify_token: emailVerifyToken,
            },
            $currentDate: { updated_at: true }

        })
        return { message: userMessage.RESEND_VERIFY_EMAIL_SUCCESS }
    }


    async checkEmailExist(email: string) {
        const response = await databaseService.getUsersCollection().findOne({ email })
        return Boolean(response)
    }

}
export const userService = new UserService()