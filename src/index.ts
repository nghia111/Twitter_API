import express from 'express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
import cors from "cors"
dotenv.config()
import { databaseService } from './services/database.service';
import { initUserRoute } from './routes/users.route'
import { initMediasRoute } from './routes/medias.route'
import { defaultErrorHandler } from './middlewares/errors.middleware';

import { initStaticRoute } from './routes/static.route';
import { initTweetRoute } from './routes/tweets.route';
import { initSearchRoute } from './routes/search.route';

databaseService.connect()

const app = express()

app.use(cors({
    // * là cho phép tất cả 
    origin: "*"
}))


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

initUserRoute(app)
initMediasRoute(app)
initStaticRoute(app)
initTweetRoute(app)
initSearchRoute(app)
// //                                    thư mục tĩnh
// app.use('/uploads', express.static(path.resolve('uploads')))
app.use(defaultErrorHandler)


const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log("server is running on port ", port)
})  