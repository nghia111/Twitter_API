import express from 'express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
dotenv.config()
import { databaseService } from './services/database.service';
import { initUserRoute } from './routes/users.route'
import { initMediasRoute } from './routes/medias.route'
import { defaultErrorHandler } from './middlewares/errors.middleware';
import path from 'path';
import { initStaticRoute } from './routes/static.route';

databaseService.connect()

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

initUserRoute(app)
initMediasRoute(app)
initStaticRoute(app)
// //                                    thư mục tĩnh
// app.use('/uploads', express.static(path.resolve('uploads')))
app.use(defaultErrorHandler)


const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log("server is running on port ", port)
})  