import { Request, Response } from "express"
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from "~/models/requests/user.request";
import { User } from "~/models/schemas/User.schema";
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
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
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



