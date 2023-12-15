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
    FORGOT_PASSWORD_TOKEN_IS_INVALID: 'forgot password token is invalid',
    FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'forgot password token is required',
    TOKEN_IS_EXPRIED: 'token is expired',
    EMAIL_HAS_BEEN_VERIFIRED: 'email has been verified',
    LOGOUT_SUCCESSFUL: 'logout successful',
    RESEND_VERIFY_EMAIL_SUCCESS: 'resend verify email success',
    UPDATE_NEW_PASSWORD_SUCCESSFUL: 'update new password successful',
    CHECK_EMAIL_TO_RESET_PASSWORD: 'check email to reset password',
    ACCOUT_IS_ALREADY_LOGGED_IN: "account is already logged in",
    LOGIN_SUCCESSFUL: 'login successful',
    GET_MY_PROFILE_SUCCESSFUL: 'get my profile successful',
    USER_NOT_VERIFY: 'user not verify',
    BIO_MUST_BE_A_STRING: 'bio must be a string',
    LOCATION_MUST_BE_A_STRING: 'location must be a string',
    WEBSITE_MUST_BE_A_STRING: 'website must be a string',
    USERNAME_INVALID: 'username must be 4-15 characters long and  contain only letters, numbers and underscores, not only numbers',
    AVATAR_MUST_BE_A_STRING: 'avatar must be a string',
    COVER_PHOTO_MUST_BE_A_STRING: 'cover_photo must be a string',
    BIO_LENGTH: 'bio length must be from 1 to 200',
    LOCATION_LENGTH: 'location length must be from 1 to 200',
    WEBSITE_LENGTH: 'website length must be from 1 to 200',
    USERNAME_ALREADY_EXIST: 'username already exist',
    AVATAR_LENGTH: 'avatar length must be from 1 to 200',
    COVER_PHOTO_LENGTH: 'cover_photo length must be from 1 to 200',
    FOLLOWED_SUCCESS: 'followed success',
    FOLLOWED_BEFORE: 'followed before',
    FOLLOWED_USER_ID_INVALID: 'followed user id invalid',
    ALREADY_UNFOLLOWED: 'already unfollowed',
    UNFOLLOW_SUCCESS: 'unfollow success',
    PASSWORD_IS_INCORRECT: 'password is incorrert',
    CHANGE_PASSWORD_SUCCESS: 'change password success',
    NEW_PASSWORD_MUST_NOT_BE_SAME: 'The new password must not be the same as the old password'
} as const