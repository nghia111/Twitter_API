import { Request, Response } from "express"
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from "~/models/requests/user.request";
import { userService } from "~/services/user.service";
export const loginController = (req: Request, res: Response) => {
    res.status(200).json('hello from login controller')
}
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
    try {
        const response = await userService.register(req.body)
        return res.status(200).json({
            err: 0,
            message: "register successful",
            response

        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            err: 1
        })
    }
}

