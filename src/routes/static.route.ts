import express from "express";
import { serveImageController } from "~/controllers/medias.controller";
const router = express.Router()
export const initStaticRoute = (app: express.Express) => {
    router.get('/image/:name', serveImageController)








    return app.use('/static', router)
}