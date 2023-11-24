
import { x64 } from "crypto-js"
import { checkSchema } from "express-validator"
import { JsonWebTokenError } from "jsonwebtoken"
import { httpStatus } from "~/constants/httpStatus"
import { userMessage } from "~/constants/message"
import { ErrorWithStatus } from "~/models/Errors"
import { databaseService } from "~/services/database.service"

import { userService } from "~/services/user.service"
import { comparePassword } from "~/utils/crypto"
import { verifyToken } from "~/utils/jwt"
import { validate } from "~/utils/validation"

export const loginValidator = validate(checkSchema({
    email: {
        notEmpty: { errorMessage: userMessage.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: userMessage.EMAIL_IS_INVALID },
        trim: true,

        custom: {
            options: async (value, { req }) => {
                const user = await databaseService.getUsersCollection().findOne({ email: value })
                if (!user || !comparePassword(req.body.password, user.password)) {
                    throw userMessage.USER_NOT_FOUND
                }
                req.user = user
                return true
            }
        }

    },
    password: {
        isString: { errorMessage: userMessage.PASSWORD_MUST_BE_A_STRING },
        notEmpty: { errorMessage: userMessage.PASSWORLD_IS_REQUIRED },
        trim: true,
        isLength: {
            errorMessage: userMessage.PASSWORD_LENGTH,
            options: {
                min: 6, max: 30
            }
        }

    },
}, ['body']))
export const registerValidator = validate(checkSchema({
    name: {
        isString: {
            errorMessage: userMessage.NAME_MUST_BE_A_STRING
        },
        notEmpty: { errorMessage: userMessage.NAME_IS_REQUIRED },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: userMessage.NAME_LENGTH
        }
    },
    email: {
        notEmpty: { errorMessage: userMessage.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: userMessage.EMAIL_IS_INVALID },
        trim: true,

        custom: {
            options: async (value) => {
                const checkEmail = await userService.checkEmailExist(value)
                if (checkEmail) {
                    throw userMessage.EMAIL_IS_USED
                }
                return true
            }
        }

    },
    password: {
        isString: { errorMessage: userMessage.PASSWORD_MUST_BE_A_STRING },
        notEmpty: { errorMessage: userMessage.PASSWORLD_IS_REQUIRED },
        trim: true,
        isLength: {
            errorMessage: userMessage.PASSWORD_LENGTH,
            options: {
                min: 6, max: 30
            }
        }
    },
    confirm_password: {
        isString: true,
        notEmpty: { errorMessage: userMessage.CONFIRM_PASSWORD_IS_REQUIRED },
        trim: true,
        isLength: {
            options: {
                min: 6, max: 30
            }
        },
        custom: {
            options: (value, { req }) => {
                if (value != req.body.password) {
                    throw userMessage.CONFIRM_PASSWORD_DOES_NOT_MATCH
                }
                return true

            }
        }
    },
    date_of_birth: {
        isISO8601: {
            errorMessage: userMessage.DATE_OF_BIRTH_MUST_BE_ISO8601,
            options: {
                strict: true,
                strictSeparator: true
            }
        }
    }






}, ['body']))
export const accessTokenValidator = validate(checkSchema({
    Authorization: {
        notEmpty: { errorMessage: userMessage.ACCESS_TOKEN_IS_REQUIRED },
        custom: {
            options: async (value, { req }) => {
                try {
                    const access_token = value.split(' ')[1]
                    if (!access_token)
                        throw new ErrorWithStatus({ message: userMessage.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
                    const decode_authorization = verifyToken(access_token, process.env.JWT_SECRET as string)
                    // console.log(decode_authorization)
                    req.decode_authorization = decode_authorization

                    return true
                } catch (error) {
                    if (error instanceof JsonWebTokenError)
                        throw new ErrorWithStatus({ message: userMessage.ACCESS_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED })
                    throw error

                }

            }
        }
    }
}, ['headers']))
export const refreshTokenValidator = validate(checkSchema({
    refreshToken: {
        notEmpty: { errorMessage: userMessage.REFRESH_TOKEN_IS_REQUIRED },
        custom: {
            options: async (value, { req }) => {
                try {
                    const rft = value.split(' ')[1]
                    if (!rft)
                        throw new ErrorWithStatus({ message: userMessage.REFRESH_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED })
                    const decode_refreshToken = verifyToken(rft, process.env.JWT_SECRET as string)
                    // console.log(decode_refreshToken)
                    req.decode_refreshToken = decode_refreshToken
                    const refreshToken = await databaseService.getRefreshTokenCollection().findOne({ token: rft })
                    if (!refreshToken) {
                        throw new ErrorWithStatus({ message: userMessage.TOKEN_IS_EXPRIED, status: httpStatus.UNAUTHORIZED })
                    }
                    return true
                } catch (error) {
                    if (error instanceof JsonWebTokenError)
                        throw new ErrorWithStatus({ message: userMessage.REFRESH_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED })
                    throw error
                }

            }
        }
    }
}, ['body']))