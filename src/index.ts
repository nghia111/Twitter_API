import express from 'express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
dotenv.config()
import { databaseService } from './services/database.service';
import { initUserRoute } from './routes/users.route'
import { defaultErrorHandler } from './middlewares/errors.middleware';

databaseService.connect()

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

initUserRoute(app)
app.use(defaultErrorHandler)

app.listen(3000, () => {
    console.log("server is running on port ", 3000)
})  