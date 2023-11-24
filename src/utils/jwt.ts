import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { httpStatus } from '~/constants/httpStatus'
import { userMessage } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'

export const signToken = (payload: any, exp: string) => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { algorithm: 'HS256', expiresIn: exp })
}
export const verifyToken = (token: string, secretKey: string) => {
    return jwt.verify(token, secretKey, (err, decode) => {
        if (err)
            return err
        return decode

    })
}