import express from "express";
const router = express.Router()
import { loginValidator, registerValidator } from "~/middlewares/users.middleware";
import { loginController, registerController } from "~/controllers/users.controller";


export const initUserRoute = (app: any) => {
    router.post('/login', loginValidator, loginController)

    /**
     * Description: Register a new user
     * method : POST
     * body: {name : string, email : string, password : string, confirm_password: string, date_of_birth: ISO8601}
     */
    router.post('/register', registerValidator, registerController)



    return app.use('/users', router)
}