import express from 'express'



export const warpFnc = <P>(func: express.RequestHandler<P, any, any, any>) => {
    return async (req: express.Request<P>, res: express.Response, next: express.NextFunction) => {
        try {
            await func(req, res, next)
        } catch (error) {
            next(error)
        }
    }

}