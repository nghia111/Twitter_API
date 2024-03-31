import express from "express";
import { searchController } from "~/controllers/search.controller";
import { paginationValidator, searchValidator } from "~/middlewares/tweets.middleware";
import { accessTokenValidator, verifyUserValidator } from "~/middlewares/users.middleware";
import { warpFnc } from "~/utils/hanlders";
const router = express.Router()
export const initSearchRoute = (app: express.Express) => {

    router.get('/', accessTokenValidator, verifyUserValidator, paginationValidator, searchValidator, warpFnc(searchController))








    return app.use('/search', router)
}