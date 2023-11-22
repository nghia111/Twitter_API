import { Request, Response } from "express"
import { userService } from "~/services/user.service";
export const loginController = (req: Request, res: Response) => {
    res.status(200).json('hello from login controller')
}
export const registerController = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
        const response = await userService.register({ email, password })
        return res.status(200).json({
            err: 0,
            message: "register successful",

        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            err: 1
        })
    }
}

