import { Request, Response, NextFunction } from 'express'
import { pick } from 'lodash'
type keys<Type> = Array<keyof Type>


// nhận tham số là 1 mảng những key cần filer
export const filterMiddleware = <Type>(filterKeys: keys<Type>) => {

    //return 1 cái middleware
    return (req: Request, res: Response, next: NextFunction) => {
        req.body = pick(req.body, filterKeys)
        next()
    }
}