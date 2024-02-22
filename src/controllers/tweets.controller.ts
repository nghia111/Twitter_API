import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { tweetMessage } from '~/constants/message'
import { BookmarkReqBody } from '~/models/requests/bookmark.request'
import { LikeReqBody } from '~/models/requests/like.request'
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


export const unbookmarkTweetController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const response = await tweetService.unbookmarkTweet(req.params.tweet_id, user_id)
    return res.json({
        message: response ? "unbookmark successfully" : "You haven't bookmarked this tweet yet",
        response
    })
}

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeReqBody>, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const response = await tweetService.likeTweet(req.body.tweet_id, user_id)
    return res.json({
        message: "like tweet successfully",
        response
    })


}

export const unlikeTweetController = async (req: Request, res: Response) => {
    const { user_id } = req.decode_authorization as TokenPayload
    const response = await tweetService.unlikeTweet(req.params.tweet_id, user_id)
    return res.json({
        message: response ? "unlike successfully" : "You haven't liked this tweet yet",
        response
    })
}
