import express from "express";
const router = express.Router()
import { loginValidator } from "~/middlewares/users.middleware";
import { loginController, registerController } from "~/controllers/users.controller";


export const initUserRoute = (app: any) => {
    router.post('/login', loginValidator, loginController)
    router.post('/register', registerController)



    return app.use('/users', router)
}