import express from 'express'
import { bookmarkTweetController, createTweetController } from '~/controllers/tweets.controller'
import { tweetValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middleware'
import { warpFnc } from '~/utils/hanlders'
const router = express.Router()
export const initTweetRoute = (app: express.Express) => {
    /**
    * Description: Create Tweet
    * method : POST
    * body: {TweetReqBody}
    */
    router.post('/create', accessTokenValidator, verifyUserValidator, tweetValidator, warpFnc(createTweetController))

    /**
    * Description: Create BookMark
    * method : POST
    * body: {TweetReqBody}
    */
    router.post('/bookmark', accessTokenValidator, verifyUserValidator, warpFnc(bookmarkTweetController))
    /**
    * Description: Create Like Tweet
    * method : POST
    * body: {TweetReqBody}
    */
    router.post('/like', accessTokenValidator, verifyUserValidator, tweetValidator, warpFnc(createTweetController))

    app.use('/tweets', router)
}