import express from "express";
import { uploadSingleImageController } from "~/controllers/medias.controller";
import { warpFnc } from "~/utils/hanlders";
const router = express.Router()
export const initMediasRoute = (app: express.Express) => {
    router.post('/upload_image',warpFnc( uploadSingleImageController))








    return app.use('/medias', router)
}