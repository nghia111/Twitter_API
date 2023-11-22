import { Request, Response, NextFunction } from "express"
import { checkSchema } from "express-validator"
import { userService } from "~/services/user.service"
import { validate } from "~/utils/validation"
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            err: "missing payload"
        })
    }
    next()
}
export const registerValidator = validate(checkSchema({
    name: {
        isString: true,
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 100
            }
        }
    },
    email: {
        notEmpty: true,
        isEmail: true,
        trim: true,

        custom: {
            options: async (value) => {
                const checkEmail = await userService.checkEmailExist(value)
                if (checkEmail) {
                    throw new Error('Email already used, try another one!')
                }
                return true
            }
        }

    },
    password: {
        isString: true,
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 6, max: 30
            }
        }
    },
    confirm_password: {
        isString: true,
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 6, max: 30
            }
        },
        custom: {
            options: (value, { req }) => {
                if (value != req.body.password) {
                    throw new Error('Password confrimation does not match')
                }
                return true

            }
        }
    },
    date_of_birth: {
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            }
        }
    }






}))