import express from "express";
import { uploadSingleImageController } from "~/controllers/medias.controller";
const router = express.Router()
export const initMediasRoute = (app: express.Express) => {
    router.post('/upload_image', uploadSingleImageController)








    return app.use('/medias', router)
}