import express from 'express'
import { bookmarkTweetController, createTweetController, getNewFeedsController, getTweetChildrenController, getTweetController, likeTweetController, unbookmarkTweetController, unlikeTweetController } from '~/controllers/tweets.controller'
import { audienceValidator, getTweetChildrenValidator, isUserLoggedInValidator, paginationValidator, tweetIdValidator, tweetValidator } from '~/middlewares/tweets.middleware'
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

    /**
    * Description: Create Like
    * method : POST
    * body: {tweet_id}
    */
    router.post('/like', accessTokenValidator, verifyUserValidator, tweetIdValidator, warpFnc(likeTweetController))

    /**
    * Description: Unlike
    * method : DELETE
    * params: {tweet_id}
    */
    router.delete('/unlike/:tweet_id', accessTokenValidator, verifyUserValidator, tweetIdValidator, warpFnc(unlikeTweetController))

    /**
    * Description: Create BookMark
    * method : POST
    * 
    */
    router.get('/:tweet_id', tweetIdValidator, isUserLoggedInValidator(accessTokenValidator), isUserLoggedInValidator(verifyUserValidator), audienceValidator, warpFnc(getTweetController))

    /**
   * Description: Get Tweet Children
   * method : POST
   * 
   * query: {limit: number, page: number, tweet_type: number}
   */
    router.get('/:tweet_id/children', tweetIdValidator, getTweetChildrenValidator, paginationValidator, isUserLoggedInValidator(accessTokenValidator), isUserLoggedInValidator(verifyUserValidator), audienceValidator, warpFnc(getTweetChildrenController))

    /**
   * Description: Get new feeds
   * method : POST
   * 
   * headers: {Authorization},
   * query: {limit: number, page: number}

   */
    router.get('/', paginationValidator, (accessTokenValidator), (verifyUserValidator), warpFnc(getNewFeedsController))







    app.use('/tweets', router)
}
