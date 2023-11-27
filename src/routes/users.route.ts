import express from "express";
const router = express.Router()
import { accessTokenValidator, emailVerifyTokenValidator, loginValidator, refreshTokenValidator, registerValidator } from "~/middlewares/users.middleware";
import { emailVerifyController, loginController, logoutController, registerController } from "~/controllers/users.controller";
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





  return app.use('/users', router)
}