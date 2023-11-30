import express from "express";
const router = express.Router()
import { accessTokenValidator, emailVerifyTokenValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator, resetPasswordValidator, verifyForgotPasswordTokenValidator } from "~/middlewares/users.middleware";
import { emailVerifyController, forgotPasswordController, loginController, logoutController, registerController, resendVerifyEmailController, resetPasswordController, } from "~/controllers/users.controller";
import { warpFnc } from "~/utils/hanlders";


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








  return app.use('/users', router)
}