import jwt from 'jsonwebtoken'

export const signToken = (payload: any, exp: string) => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { algorithm: 'HS256', expiresIn: exp })
}