import { httpStatus } from "~/constants/httpStatus"
import { userMessage } from "~/constants/message"

type ErrorType = Record<string, {
    msg: string,
    [key: string]: any
}>
export class ErrorWithStatus {
    message: string
    status: number
    constructor({ message, status }: { message: string, status: number }) {
        this.message = message
        this.status = status
    }

}
export class EntityError extends ErrorWithStatus {

    errors: ErrorType
    constructor({ message = userMessage.VALIDATION_ERROR, error }: { message?: string, error: ErrorType }) {
        super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
        this.errors = error
    }

}