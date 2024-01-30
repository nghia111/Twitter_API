import express from "express";
import { uploadImageController, uploadVideoController } from "~/controllers/medias.controller";
import { accessTokenValidator, verifyUserValidator } from "~/middlewares/users.middleware";
import { warpFnc } from "~/utils/hanlders";
const router = express.Router()
export const initMediasRoute = (app: express.Express) => {
    router.post('/upload_image', accessTokenValidator, verifyUserValidator, warpFnc(uploadImageController))

    router.post('/upload_video', accessTokenValidator, verifyUserValidator, warpFnc(uploadVideoController))








    return app.use('/medias', router)
}