import jwt from 'jsonwebtoken'

export const signToken = (payload: any, key: string, exp?: string | number) => {
    if (exp)
        return jwt.sign(payload, key, { algorithm: 'HS256', expiresIn: exp })
    else
        return jwt.sign(payload, key, { algorithm: 'HS256' })
}
export const verifyToken = (token: string, secretKey: string) => {
    return jwt.verify(token, secretKey, (err, decode) => {
        if (err)
            return err
        return decode

    })
}