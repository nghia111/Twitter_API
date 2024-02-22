import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { tweetMessage } from '~/constants/message'
import { BookmarkReqBody } from '~/models/requests/bookmark.request'
import { TweetReqBody } from '~/models/requests/tweet.request'
import { TokenPayload } from '~/models/requests/user.request'
import { tweetService } from '~/services/tweet.service'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetReqBody>, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const response = await tweetService.createTweet(req.body, user_id)
    return res.json({
        message: tweetMessage.CREATE_TWEET_SUCCESSFULLY,
        response
    })
}

export const bookmarkTweetController = async (req: Request<ParamsDictionary, any, BookmarkReqBody>, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const response = await tweetService.bookmarkTweet(req.body.tweet_id, user_id)
    return res.json({
        message: "create bookmark successfully",
        response
    })
}