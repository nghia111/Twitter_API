import { log } from "console";
import { Request, Response } from "express"
import { ParamsDictionary } from 'express-serve-static-core'
import { pick } from "lodash";
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enums";
import { httpStatus } from "~/constants/httpStatus";
import { userMessage } from "~/constants/message";
import { RegisterReqBody, TokenPayload } from "~/models/requests/user.request";
import { User } from "~/models/schemas/User.schema";
import { databaseService } from "~/services/database.service";
import { userService } from "~/services/user.service";

import dotenv from 'dotenv'
dotenv.config()

export const loginController = async (req: Request, res: Response) => {
    const user = req.user as User
    const user_id = user._id
    const checkLogged = await databaseService.getRefreshTokenCollection().findOne({ user_id: user_id })
    if (checkLogged) return res.json({ message: userMessage.ACCOUT_IS_ALREADY_LOGGED_IN })
    const response = await userService.login(user_id.toString(), user.verify)
    return res.status(200).json({
        message: userMessage.LOGIN_SUCCESS,
        response
    })
}
export const registerController = async (req: Request, res: Response) => {
    const response = await userService.register(req.body)
    return res.status(200).json({
        err: 0,
        message: userMessage.REGISTER_SUCCESS,
        response

    })
}
export const logoutController = async (req: Request, res: Response) => {
    const { refreshToken } = req.body
    const response = await userService.logout(refreshToken.split(' ')[1])

    res.status(200).json({
        response
    })
}

export const refreshTokenController = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken
    const { user_id, verify } = req.decode_refreshToken as TokenPayload
    const response = await userService.refreshToken(user_id, verify, refreshToken)
    return res.json({
        mes: userMessage.REFRESH_TOKEN_SUCCESS,
        response
    })
}

export const emailVerifyController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_verify_email as TokenPayload
    // đã verify rồi thì không báo lỗi mà trả về message là đã verify trước đó rồi
    const user = await databaseService.getUsersCollection().findOne({ _id: new ObjectId(user_id) })
    if (!user)
        return res.status(httpStatus.NOT_FOUND).json({ message: userMessage.USER_NOT_FOUND })
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
    const { user_id, verify } = req.decode_authorization as TokenPayload
    const user = await databaseService.getUsersCollection().findOne({ _id: new ObjectId(user_id) })
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: userMessage.USER_NOT_FOUND })
    }
    if (user.verify == UserVerifyStatus.Verified) {
        return res.status(200).json({ message: userMessage.EMAIL_HAS_BEEN_VERIFIRED })
    }
    const response = await userService.resendVerifyEmail(user_id, verify)
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
export const getMyProfileController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const user = await userService.getMyProfile(user_id)
    res.json({
        message: userMessage.GET_MY_PROFILE_SUCCESSFUL,
        data: user
    })

}
export const updateMyProfileController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const response = await userService.updateMyProfile(user_id, req.body)
    return res.json(response)
}

export const followUserController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const { followed_user_id } = req.body
    const response = await userService.follow(user_id, followed_user_id)
    return res.json(response)
}

export const unfollowUserController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const { followed_user_id } = req.params
    const response = await userService.unfollow(user_id, followed_user_id)
    return res.json(response)
}

export const changePasswordController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const { password } = req.body
    const response = await userService.changePassword(user_id, password)
    return res.json(response)
}

export const oauthController = async (req: Request, res: Response) => {
    const { code } = req.query
    const response = await userService.oauth(code as string)
    const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${response.accessToken}&refresh_token=${response.refreshToken}&new_user=${response.newUser}`
    return res.redirect(urlRedirect)

}