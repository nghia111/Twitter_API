import express from 'express'
import { bookmarkTweetController, createTweetController, likeTweetController, unbookmarkTweetController, unlikeTweetController } from '~/controllers/tweets.controller'
import { tweetIdValidator, tweetValidator } from '~/middlewares/tweets.middleware'
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
    * body: {tweet_id}
    */
    router.post('/bookmark', accessTokenValidator, verifyUserValidator, tweetIdValidator, warpFnc(bookmarkTweetController))
    /**
    * Description: Unbookmark
    * method : DELETE
    * params: {tweet_id}
    */
    router.delete('/unbookmark/:tweet_id', accessTokenValidator, verifyUserValidator, tweetIdValidator, warpFnc(unbookmarkTweetController))

    router.post('/like', accessTokenValidator, verifyUserValidator, tweetIdValidator, warpFnc(likeTweetController))

    router.delete('/unlike/:tweet_id', accessTokenValidator, verifyUserValidator, tweetIdValidator, warpFnc(unlikeTweetController))








    app.use('/tweets', router)
}
