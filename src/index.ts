import express from 'express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
dotenv.config()
import { databaseService } from './services/database.service';
databaseService.connect()

const app = express()
import { initUserRoute } from './routes/users.route'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

initUserRoute(app)
app.listen(3000, () => {
    console.log("server is running on port ", 3000)
})  