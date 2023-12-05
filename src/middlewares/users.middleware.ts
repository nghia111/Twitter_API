

import express from 'express'
import { NextFunction } from "express"
import { checkSchema } from "express-validator"
import { JsonWebTokenError } from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { UserVerifyStatus } from '~/constants/enums'
import { httpStatus } from "~/constants/httpStatus"
import { userMessage } from "~/constants/message"
import { ErrorWithStatus } from "~/models/Errors"
import { TokenPayload } from "~/models/requests/user.request"
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
        custom: {
            options: async (value, { req }) => {
                try {
                    if (!value) throw new ErrorWithStatus({ message: userMessage.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
                    const access_token = value.split(' ')[1]
                    if (!access_token) throw new ErrorWithStatus({ message: userMessage.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
                    const decode_authorization = verifyToken(access_token, process.env.JWT_SECRET_ACCESS_TOKEN as string)
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
        custom: {
            options: async (value, { req }) => {
                try {
                    if (!value) throw new ErrorWithStatus({ message: userMessage.REFRESH_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
                    const rft = value.split(' ')[1]
                    if (!rft) throw new ErrorWithStatus({ message: userMessage.REFRESH_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED })
                    const decode_refreshToken = verifyToken(rft, process.env.JWT_SECRET_REFRESH_TOKEN as string)
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

export const emailVerifyTokenValidator = validate(checkSchema({
    emailVerifyToken: {
        custom: {
            options: async (value, { req }) => {
                try {
                    if (!value) throw new ErrorWithStatus({ message: userMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
                    const evft = value.split(' ')[1]
                    if (!evft)
                        throw new ErrorWithStatus({ message: userMessage.EMAIL_VERIFY_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED })
                    // decode này là userid

                    const decode_verify_email = verifyToken(evft, process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string)
                    req.decode_verify_email = decode_verify_email
                    return true
                } catch (error) {
                    if (error instanceof JsonWebTokenError)
                        throw new ErrorWithStatus({ message: userMessage.EMAIL_VERIFY_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED })
                    throw error
                }

            }
        }
    }
}, ['body']))

export const forgotPasswordValidator = validate(checkSchema({
    email: {
        notEmpty: { errorMessage: userMessage.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: userMessage.EMAIL_IS_INVALID },
        trim: true,

        custom: {
            options: async (value, { req }) => {
                const user = await databaseService.getUsersCollection().findOne({ email: value })
                if (!user) {
                    throw userMessage.USER_NOT_FOUND
                }
                req.user = user
                return true
            }
        }

    },

}, ['body']))

export const verifyForgotPasswordTokenValidator = validate(checkSchema({
    forgotPasswordToken: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                try {
                    if (!value) throw new ErrorWithStatus({ message: userMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
                    const fpt = value.split(' ')[1]
                    if (!fpt) throw new ErrorWithStatus({ message: userMessage.FORGOT_PASSWORD_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED })
                    const decode_forgot_password_token = verifyToken(fpt, process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string)
                    const { user_id }: any = decode_forgot_password_token
                    req.decode_forgot_password_token = decode_forgot_password_token

                    const user = await databaseService.getUsersCollection().findOne({ _id: new ObjectId(user_id) })
                    if (!user) {
                        throw new ErrorWithStatus({ message: userMessage.TOKEN_IS_EXPRIED, status: httpStatus.UNAUTHORIZED })
                    }
                    if (user.forgot_password_token == '')
                        throw new ErrorWithStatus({ message: userMessage.TOKEN_IS_EXPRIED, status: httpStatus.UNAUTHORIZED })
                    return true
                } catch (error) {
                    if (error instanceof JsonWebTokenError)
                        throw new ErrorWithStatus({ message: userMessage.FORGOT_PASSWORD_TOKEN_IS_INVALID, status: httpStatus.UNAUTHORIZED })
                    throw error
                }

            }
        }

    },

}, ['body']))

export const resetPasswordValidator = validate(checkSchema({
    newPassword: {
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
                if (value != req.body.newPassword) {
                    throw userMessage.CONFIRM_PASSWORD_DOES_NOT_MATCH
                }
                return true

            }
        }
    },

}, ['body']))

export const verifyUserValidator = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { verify } = req.decode_authorization as TokenPayload
    if (verify != UserVerifyStatus.Verified)
        return next(new ErrorWithStatus({ message: userMessage.USER_NOT_VERIFY, status: httpStatus.FORBIDDEN }))
    next()
}
export const updateMyProfileValidator = validate(checkSchema({
    name: {
        notEmpty: undefined,
        optional: true, // có thể có hoặc không
        isString: {
            errorMessage: userMessage.NAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: userMessage.NAME_LENGTH
        }
    },
    date_of_birth: {
        optional: true, // có thể có hoặc không
        isISO8601: {
            errorMessage: userMessage.DATE_OF_BIRTH_MUST_BE_ISO8601,
            options: {
                strict: true,
                strictSeparator: true
            }
        }
    },
    bio: {
        optional: true, // có thể có hoặc không
        isString: {
            errorMessage: userMessage.BIO_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 200
            },
            errorMessage: userMessage.BIO_LENGTH
        }
    },
    location: {
        optional: true, // có thể có hoặc không
        isString: {
            errorMessage: userMessage.LOCATION_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 200
            },
            errorMessage: userMessage.LOCATION_LENGTH
        }
    },
    website: {
        optional: true, // có thể có hoặc không
        isString: {
            errorMessage: userMessage.WEBSITE_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 200
            },
            errorMessage: userMessage.WEBSITE_LENGTH
        }
    },
    username: {
        optional: true, // có thể có hoặc không
        isString: {
            errorMessage: userMessage.USERNAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: userMessage.USERNAME_LENGTH
        }
    },
    avatar: {
        optional: true, // có thể có hoặc không
        isString: {
            errorMessage: userMessage.AVATAR_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: userMessage.AVATAR_LENGTH
        }
    },
    cover_photo: {
        optional: true, // có thể có hoặc không
        isString: {
            errorMessage: userMessage.COVER_PHOTO_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: userMessage.COVER_PHOTO_LENGTH
        }
    },



}, ['body']))