import { User } from "~/models/schemas/User.schema";
import { databaseService } from "./database.service";
import { RegisterReqBody } from "~/models/requests/user.request";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType } from "~/constants/enums";

class UserService {

    private signAccessToken(user_id: string) {
        const payload = {
            user_id,
            token_type: TokenType.AccessToken
        }
        return signToken(payload, process.env.ACCESS_TOKEN_EXPIRES_IN as string)
    }
    private signRefreshToken(user_id: string) {
        const payload = {
            user_id,
            token_type: TokenType.RefreshToken
        }
        return signToken(payload, process.env.REFRESH_TOKEN_EXPIRES_IN as string)
    }


    async register(payload: RegisterReqBody) {
        const response = await databaseService.getUsersCollection().insertOne(new User({
            ...payload,
            date_of_birth: new Date(payload.date_of_birth),
            password: hashPassword(payload.password)
        }))
        const userid = response.insertedId.toString()
        const [AccessToken, RefreshToken] = await Promise.all([
            this.signAccessToken(userid),
            this.signRefreshToken(userid)
        ])


        return {
            AccessToken,
            RefreshToken
        }
    }
    async checkEmailExist(email: string) {
        const response = await databaseService.getUsersCollection().findOne({ email })
        return Boolean(response)
    }
}
export const userService = new UserService()