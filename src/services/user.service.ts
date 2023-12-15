import { User } from "~/models/schemas/User.schema";
import { databaseService } from "./database.service";
import { RegisterReqBody, UpdateMyProfile } from "~/models/requests/user.request";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import { ObjectId } from "mongodb";
import { RefreshToken } from "~/models/schemas/RefreshToken.schema";
import { userMessage } from "~/constants/message";
import { Follower } from "~/models/schemas/Follower.schema";


class UserService {

    async checkEmailExist(email: string) {
        const response = await databaseService.getUsersCollection().findOne({ email })
        return Boolean(response)
    }

    private signAccessToken(user_id: string, verify: UserVerifyStatus) {
        const payload = {
            user_id,
            verify,
            token_type: TokenType.AccessToken
        }
        return signToken(payload, process.env.JWT_SECRET_ACCESS_TOKEN as string, process.env.ACCESS_TOKEN_EXPIRES_IN as string)
    }
    private signRefreshToken(user_id: string, verify: UserVerifyStatus) {
        const payload = {
            user_id,
            verify,
            token_type: TokenType.RefreshToken
        }
        return signToken(payload, process.env.JWT_SECRET_REFRESH_TOKEN as string, process.env.REFRESH_TOKEN_EXPIRES_IN as string)
    }
    private signAccessTokenAndRefreshToken(user_id: string, verify: UserVerifyStatus) {
        return Promise.all([
            this.signAccessToken(user_id, verify),
            this.signRefreshToken(user_id, verify)
        ])
    }
    private signEmailVerifyToken(user_id: string, verify: UserVerifyStatus) {
        const payload = {
            user_id,
            verify,
            token_type: TokenType.EmailVerifyToken
        }
        return signToken(payload, process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string, process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string)
    }
    private signForgotPasswordToken(user_id: string, verify: UserVerifyStatus) {
        const payload = {
            user_id,
            verify,
            token_type: TokenType.ForgotpasswordToken
        }
        return signToken(payload, process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string, process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string)
    }

    async login(userid: string, verify: UserVerifyStatus) {
        const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken(userid, verify)
        await databaseService.getRefreshTokenCollection().insertOne(new RefreshToken({ user_id: new ObjectId(userid), token: refreshToken }))

        return {
            accessToken,
            refreshToken
        }
    }




    async register(payload: RegisterReqBody) {
        const userid = new ObjectId()
        const emailVerifyToken = this.signEmailVerifyToken(userid.toString(), UserVerifyStatus.Unverified)
        console.log('Người dùng hãy check email để verify:  đây là token ', emailVerifyToken)
        await databaseService.getUsersCollection().insertOne(new User({
            _id: userid,
            email_verify_token: emailVerifyToken,
            ...payload,
            date_of_birth: new Date(payload.date_of_birth),
            password: hashPassword(payload.password)
        }))
        const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken(userid.toString(), UserVerifyStatus.Unverified)
        await databaseService.getRefreshTokenCollection().insertOne(new RefreshToken({ user_id: userid, token: refreshToken }))
        return {
            accessToken,
            refreshToken
        }
    }
    async logout(refreshToken: string) {
        // console.log(refreshToken)
        const response = await databaseService.getRefreshTokenCollection().deleteOne({ token: refreshToken })
        return { message: userMessage.LOGOUT_SUCCESSFUL }
    }
    async verifyEmail(userid: string) {
        // console.log(refreshToken)
        await databaseService.getUsersCollection().updateOne({ _id: new ObjectId(userid) },
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
        await databaseService.getRefreshTokenCollection().deleteOne({ user_id: new ObjectId(userid) })
        return await this.login(userid, UserVerifyStatus.Verified)


    }
    async resendVerifyEmail(userId: string, verify: UserVerifyStatus) {
        const emailVerifyToken = this.signEmailVerifyToken(userId, verify)
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

    async forgotPassword(user: User) {
        const forgotPasswordToken = this.signForgotPasswordToken(user._id.toString(), user.verify)
        await databaseService.getUsersCollection().updateOne({ _id: user._id }, {
            $set: {
                forgot_password_token: forgotPasswordToken
            },
            $currentDate: { updated_at: true }
        })
        // gửi đến email người dùng 1 cái link có kèm forgotpasswordtoken 
        console.log('forgot password token: ', forgotPasswordToken)
        return { message: userMessage.CHECK_EMAIL_TO_RESET_PASSWORD }
    }

    async resetPassWord(user_id: string, password: string) {
        password = hashPassword(password)
        await databaseService.getUsersCollection().updateOne({ _id: new ObjectId(user_id) }, {
            $set: {
                password: password,
                forgot_password_token: '',


            },
            $currentDate: {
                updated_at: true
            }
        }
        )
        return { message: userMessage.UPDATE_NEW_PASSWORD_SUCCESSFUL }
    }

    async getMyProfile(user_id: string) {
        const response = await databaseService.getUsersCollection().findOne({ _id: new ObjectId(user_id) }, {
            projection: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                updated_at: 0,
            }
        })
        return response
    }
    async updateMyProfile(user_id: string, dataUpdate: UpdateMyProfile) {
        const _dataUpdate = dataUpdate.date_of_birth ? { ...dataUpdate, date_of_birth: new Date(dataUpdate.date_of_birth) } : dataUpdate
        const response = await databaseService.getUsersCollection().findOneAndUpdate({
            _id: new ObjectId(user_id)
        }, {
            $set: {
                ...(_dataUpdate as UpdateMyProfile & { date_of_birth?: Date })
            }
            , $currentDate: { updated_at: true }
        },
            {
                returnDocument: 'after',
                projection: {
                    password: 0,
                    email_verify_token: 0,
                    forgot_password_token: 0
                }
            })
        return response
    }
    async follow(user_id: string, followed_user_id: string) {
        // check xem user này đã follow chưa
        const checkFollow = await databaseService.getFollowersCollection().findOne({
            user_id: new ObjectId(user_id),
            followed_user_id: new ObjectId(followed_user_id)
        })

        if (checkFollow) return { message: userMessage.FOLLOWED_BEFORE }

        await databaseService.getFollowersCollection().insertOne(new Follower({
            user_id: new ObjectId(user_id),
            followed_user_id: new ObjectId(followed_user_id)
        }))
        return { message: userMessage.FOLLOWED_SUCCESS }


    }


    async unfollow(user_id: string, followed_user_id: string) {
        const response = await databaseService.getFollowersCollection().deleteOne({
            user_id: new ObjectId(user_id),
            followed_user_id: new ObjectId(followed_user_id)
        })
        // nghĩa là tìm ko ra là chưa follow người này
        if (!response.deletedCount) return { message: userMessage.ALREADY_UNFOLLOWED }
        else return { message: userMessage.UNFOLLOW_SUCCESS }


    }

    async changePassword(user_id: string, password: string) {
        await databaseService.getUsersCollection().updateOne({ _id: new ObjectId(user_id) }, {
            $set: {
                password: hashPassword(password)
            }, $currentDate: { updated_at: true }
        })


        return { message: userMessage.CHANGE_PASSWORD_SUCCESS }


    }
}
export const userService = new UserService()