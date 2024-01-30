import express from "express";
import { serveImageController, serveVideoController } from "~/controllers/medias.controller";
const router = express.Router()
export const initStaticRoute = (app: express.Express) => {
    router.get('/image/:name', serveImageController)
    router.get('/video/:name', serveVideoController)









    return app.use('/static', router)
}