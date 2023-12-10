import express from "express";
const router = express.Router()
import { accessTokenValidator, updateMyProfileValidator, emailVerifyTokenValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator, resetPasswordValidator, verifyForgotPasswordTokenValidator, verifyUserValidator, followUserValidator } from "~/middlewares/users.middleware";
import { emailVerifyController, followUserController, forgotPasswordController, getMyProfileController, loginController, logoutController, registerController, resendVerifyEmailController, resetPasswordController, updateMyProfileController, } from "~/controllers/users.controller";
import { warpFnc } from "~/utils/hanlders";
import { filterMiddleware } from "~/middlewares/common.middleware";
import { UpdateMyProfile } from "~/models/requests/user.request";


export const initUserRoute = (app: any) => {
    router.post('/login', loginValidator, warpFnc(loginController))

    /**
     * Description: Register a new user
     * method : POST
     * body: {name : string, email : string, password : string, confirm_password: string, date_of_birth: ISO8601}
     */
    router.post('/register', registerValidator, warpFnc(registerController))

    /**
      * Description: logout a new user
      * method : POST
      * header:{Authorization   : Bearer <accesstoken>}
      * body: {refresh_token: string}
      */
    router.post('/logout', accessTokenValidator, refreshTokenValidator, warpFnc(logoutController))

    /**
        * Description: verify when user click on the link in email
        * method : POST
        * body: {email_verify_token: string}
        */
    router.post('/verify_email', emailVerifyTokenValidator, warpFnc(emailVerifyController))

    /**
        * Description: when user click on resend email token
        * method : POST
        * header: {access_token} // nghĩa là phải đăng nhập mới được resend
        */
    router.post('/resend_verify_email', accessTokenValidator, warpFnc(resendVerifyEmailController))

    /**
        * Description: when user click on progot password button
        * method : POST
        * body: {email : string} 
        */
    router.post('/forgot_password', forgotPasswordValidator, warpFnc(forgotPasswordController))


    /**
        * Description: when user click link on email after that submit new password form
        * method : POST
        * body: {forgotPasswordToken, newPassword, confirmPassword} 
        */
    router.post('/reset_password', verifyForgotPasswordTokenValidator, resetPasswordValidator, warpFnc(resetPasswordController))

    /**
        * Description: get my profile
        * method : GET
        * headers: {Authorization: Bearer <accessToken>} 
        */
    router.get('/me', accessTokenValidator, warpFnc(getMyProfileController))

    /**
        * Description: update my profile
        * method : PATCH 
        * headers: {Authorization: Bearer <accessToken>} 
        * body: {UpdateMyProfile}
        */
    router.patch('/me', accessTokenValidator, verifyUserValidator, updateMyProfileValidator, filterMiddleware<UpdateMyProfile>(['name', 'date_of_birth', 'bio', 'location', 'website', 'avatar', 'username', 'cover_photo']), warpFnc(updateMyProfileController))



    /**
        * Description: update my profile
        * method : PATCH 
        * headers: {Authorization: Bearer <accessToken>} 
        * body: {UpdateMyProfile}
        */
    router.post('/follow_user', accessTokenValidator, verifyUserValidator, followUserValidator, warpFnc(followUserController))









    return app.use('/users', router)
}