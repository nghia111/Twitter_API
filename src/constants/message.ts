export const userMessage = {
    VALIDATION_ERROR: 'validation error',
    NAME_IS_REQUIRED: 'name is required',
    NAME_MUST_BE_A_STRING: 'name must be a string',
    NAME_LENGTH: 'name length must be from 1 to 100',
    EMAIL_IS_USED: 'email is used, please try another one!',
    EMAIL_IS_REQUIRED: 'email is required',
    EMAIL_IS_INVALID: 'email is invalid',
    PASSWORLD_IS_REQUIRED: 'password is required',
    PASSWORD_MUST_BE_A_STRING: 'password must be a string',
    PASSWORD_LENGTH: 'password length must be from 6 to 30',
    CONFIRM_PASSWORD_IS_REQUIRED: 'confirm password is required',
    CONFIRM_PASSWORD_DOES_NOT_MATCH: 'Password confrimation does not match',
    DATE_OF_BIRTH_MUST_BE_ISO8601: 'date of birth must be iso8601',
    USER_NOT_FOUND: 'user not found',
    ACCESS_TOKEN_IS_REQUIRED: 'access token is required',
    ACCESS_TOKEN_IS_INVALID: 'access token is invalid',
    REFRESH_TOKEN_IS_REQUIRED: 'refresh token is required',
    REFRESH_TOKEN_IS_INVALID: 'refresh token is invalid',
    EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'email verify token is required',
    EMAIL_VERIFY_TOKEN_IS_INVALID: 'email verify token is invalid',
    TOKEN_IS_EXPRIED: 'token is expired',
    EMAIL_HAS_BEEN_VERIFIRED: 'email has been verified',
    RESEND_VERIFY_EMAIL_SUCCESS: 'resend verify email success',
} as const