import { log } from "console";
import { Request, Response } from "express"
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enums";
import { httpStatus } from "~/constants/httpStatus";
import { userMessage } from "~/constants/message";
import { RegisterReqBody, TokenPayload } from "~/models/requests/user.request";
import { User } from "~/models/schemas/User.schema";
import { databaseService } from "~/services/database.service";
import { userService } from "~/services/user.service";
export const loginController = async (req: Request, res: Response) => {
    const user = req.user as User
    const user_id = user._id
    const response = await userService.login(user_id.toString())
    return res.status(200).json({
        err: 0,
        message: 'login successful',
        response
    })
}
export const registerController = async (req: Request, res: Response) => {
    const response = await userService.register(req.body)
    return res.status(200).json({
        err: 0,
        message: "register successful",
        response

    })
}
export const logoutController = async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    const response = await userService.logout(refreshToken.split(' ')[1])

    res.status(200).json({
        message: 'logout successful',
        response
    })
}
export const emailVerifyController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_verify_email as TokenPayload

    const user = await databaseService.getUsersCollection().findOne({ _id: new ObjectId(user_id) })
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: userMessage.USER_NOT_FOUND })
    }

    // đã verify rồi thì không báo lỗi mà trả về message là đã verify trước đó rồi
    if (user.verify == UserVerifyStatus.Verified)
        return res.status(200).json({ message: userMessage.EMAIL_HAS_BEEN_VERIFIRED })

    // nếu chưa verify thì thực hiện verify
    const response = await userService.verifyEmail(user_id)
    res.status(200).json({
        message: 'verify thành công',
        response
    })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const user = await databaseService.getUsersCollection().findOne({ _id: new ObjectId(user_id) })
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: userMessage.USER_NOT_FOUND })
    }
    if (user.verify == UserVerifyStatus.Verified) {
        return res.status(200).json({ message: userMessage.EMAIL_HAS_BEEN_VERIFIRED })
    }
    const response = await userService.resendVerifyEmail(user_id)
    res.status(200).json(response)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
    const user = req.user
    const response = await userService.forgotPassword(user as User)
    res.json(response)
}
export const resetPasswordController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_forgot_password_token as TokenPayload
    const password = req.body.newPassword
    const response = await userService.resetPassWord(user_id, password)
    res.json(response)
}



