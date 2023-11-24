import express from 'express';
import { body, validationResult, ContextRunner, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import { httpStatus } from '~/constants/httpStatus';
import { EntityError, ErrorWithStatus } from '~/models/Errors';
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        await validation.run(req)
        // nếu ko có lỗi thì next
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        const errorsObject = errors.mapped()
        const entityError = new EntityError({ error: {} })
        for (const key in errorsObject) {
            const { msg } = errorsObject[key]
            // trả về lỗi không phải do validate
            if (msg instanceof ErrorWithStatus && msg.status != httpStatus.UNPROCESSABLE_ENTITY) {
                return next(msg)
            }
            entityError.errors[key] = errorsObject[key]
        }
        // trả về lỗi do validate
        next(entityError)
    };
};
