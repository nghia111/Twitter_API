import { checkSchema } from "express-validator";
import { isEmpty, isString } from "lodash";
import { ObjectId } from "mongodb";
import { MediaType, MediaTypeQuery, PeopleFollow, TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums";
import { tweetMessage, userMessage } from "~/constants/message";
import { ErrorWithStatus } from "~/models/Errors";
import { databaseService } from "~/services/database.service";
import { numberEnumToArray } from "~/utils/other";
import { validate } from "~/utils/validation";
import { Request, Response, NextFunction, RequestHandler } from "express";
import Tweet from "~/models/schemas/Tweet.schema";
import { httpStatus } from "~/constants/httpStatus";
import { User } from "~/models/schemas/User.schema";
import { warpFnc } from "~/utils/hanlders";
const tweetType = (numberEnumToArray(TweetType))
const tweetAudience = numberEnumToArray(TweetAudience)
const mediatype = numberEnumToArray(MediaType)
export const tweetValidator = validate(

    checkSchema(
        {
            type: {
                isIn: {
                    options: [tweetType],
                    errorMessage: tweetMessage.INVALID_TWEET_TYPE
                }
            },
            audience: {
                isIn: {
                    options: [tweetAudience],
                    errorMessage: tweetMessage.INVALID_AUDIENCE_TYPE
                }
            },
            parent_id: {
                custom: {
                    options: ((value, { req }) => {
                        const type = req.body.type as TweetType
                        // nếu 'type' là retweet, comment, quotetweet thì 'parent_id' phải là 'tweet_id' của tweet cha
                        if ([TweetType.QuoteTweet, TweetType.Retweet, TweetType.Comment].includes(type) && !ObjectId.isValid(value)) {
                            throw new Error(tweetMessage.PARENT_ID_MUST_BE_A_VALID_tWEET_ID)
                        }
                        if (type == TweetType.Tweet && value != null) {
                            throw new Error(tweetMessage.PARENT_ID_MUST_BE_NULL)
                        }
                        return true
                    })
                }
            },
            content: {
                isString: true,
                custom: {
                    options: ((value, { req }) => {
                        const type = req.body.type as TweetType
                        const hashtags = req.body.hashtags as string[]
                        const mentions = req.body.mentions as string[]
                        // nếu 'type' là comment, quotetweet, tweet và không có 'mentions' và 'hastags' thì content phải là string và không rỗng
                        if ([TweetType.QuoteTweet, TweetType.Tweet, TweetType.Comment].includes(type) && isEmpty(hashtags) && isEmpty(mentions) && value == '') {
                            throw new Error(tweetMessage.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
                        }
                        // nếu type là retweet thì conent phải '' 
                        if (type == TweetType.Retweet && value != '') {
                            throw new Error(tweetMessage.CONTENT_MUST_BE_EMPTY_STRING)
                        }
                        return true
                    })
                }
            },
            hashtags: {
                isArray: true,
                custom: {
                    options: (values, { req }) => {
                        // yêu cầu mỗi phân tử trong array phải là string
                        if (values.some((item: any) => { typeof item !== 'string' }))
                            throw new Error(tweetMessage.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
                        return true
                    }
                }
            },
            mentions: {
                isArray: true,
                custom: {
                    options: (values, { req }) => {
                        // yêu cầu mỗi phân tử trong array phải là user id
                        if (values.some((item: any) => { !ObjectId.isValid(item) }))
                            throw new Error(tweetMessage.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
                        return true
                    }
                }
            },
            medias: {
                isArray: true,
                custom: {
                    options: (values, { req }) => {
                        // yêu cầu mỗi phân tử trong array phải là Media Object
                        if (values.some((item: any) => {
                            if (typeof item.url !== 'string' || !mediatype.includes(item.type))
                                return true
                        }))
                            throw new Error(tweetMessage.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
                        return true
                    }
                }
            }


        })
)

export const tweetIdValidator = validate(checkSchema({
    tweet_id: {
        isString: true,
        custom: {
            options: async (value, { req }) => {
                if (!ObjectId.isValid(value)) {
                    throw new Error("tweet_id is invalid a ObjectId type")
                }
                const tweet = (await databaseService.getTweetsCollection().aggregate([
                    {
                        '$match': {
                            '_id': new ObjectId(value)
                        }
                    }, {
                        '$lookup': {
                            'from': 'hashtags',
                            'localField': 'hashtags',
                            'foreignField': '_id',
                            'as': 'hashtags'
                        }
                    }, {
                        '$addFields': {
                            'hashtags': {
                                '$map': {
                                    'input': '$hashtags',
                                    'as': 'item',
                                    'in': {
                                        '_id': '$$item._id',
                                        '_name': '$$item.name'
                                    }
                                }
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': 'users',
                            'localField': 'mentions',
                            'foreignField': '_id',
                            'as': 'mentions'
                        }
                    }, {
                        '$addFields': {
                            'mentions': {
                                '$map': {
                                    'input': '$mentions',
                                    'as': 'item',
                                    'in': {
                                        '_id': '$$item._id',
                                        'name': '$$item.name',
                                        'username': '$$item.username',
                                        'email': '$$item.email'
                                    }
                                }
                            }
                        }
                    }, {
                        '$lookup': {
                            'from': 'likes',
                            'localField': '_id',
                            'foreignField': 'tweet_id',
                            'as': 'likes'
                        }
                    }, {
                        '$lookup': {
                            'from': 'bookmarks',
                            'localField': '_id',
                            'foreignField': 'tweet_id',
                            'as': 'bookmarks'
                        }
                    }, {
                        '$lookup': {
                            'from': 'tweets',
                            'localField': '_id',
                            'foreignField': 'parent_id',
                            'as': 'tweet_children'
                        }
                    }, {
                        '$addFields': {
                            'bookmarks': {
                                '$size': '$bookmarks'
                            },
                            'likes': {
                                '$size': '$likes'
                            },
                            'retweet_count': {
                                '$size': {
                                    '$filter': {
                                        'input': '$tweet_children',
                                        'as': 'item',
                                        'cond': {
                                            '$eq': [
                                                '$$item.type', TweetType.Retweet
                                            ]
                                        }
                                    }
                                }
                            },
                            'commentt_count': {
                                '$size': {
                                    '$filter': {
                                        'input': '$tweet_children',
                                        'as': 'item',
                                        'cond': {
                                            '$eq': [
                                                '$$item.type', TweetType.Comment
                                            ]
                                        }
                                    }
                                }
                            },
                            'quotetweet_count': {
                                '$size': {
                                    '$filter': {
                                        'input': '$tweet_children',
                                        'as': 'item',
                                        'cond': {
                                            '$eq': [
                                                '$$item.type', TweetType.QuoteTweet
                                            ]
                                        }
                                    }
                                }
                            },

                        }
                    }, {
                        '$project': {
                            'tweet_children': 0
                        }
                    }
                ]).toArray())[0]
                if (!tweet) {
                    throw new Error("Tweet Not Found")
                }
                // console.log(tweet)
                req.tweet = tweet
                return true
            }
        }
    }
}, ['params', 'body']))

export const isUserLoggedInValidator = (middleware: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.headers.authorization) {
            return middleware(req, res, next)
        }
        next()
    }
}

// muốn sử dụng async await trong handler express thì phải có try catch
// không thì phải có warpfunction
export const audienceValidator = warpFnc(async (req: Request, res: Response, next: NextFunction) => {
    const tweet = (req.tweet) as Tweet
    if (tweet.audience == TweetAudience.TwitterCircle) {
        // kiểm tra người get tweet này đã đăng nhập hay chưa
        if (!req.decode_authorization) {
            throw new ErrorWithStatus({ message: userMessage.ACCESS_TOKEN_IS_REQUIRED, status: httpStatus.UNAUTHORIZED })
        }
        // kiểm tra tài khoản tác giả có bị xóa hay ban không
        const author = await databaseService.getUsersCollection().findOne({ _id: new ObjectId(tweet.user_id) })
        if (!author || author.verify == UserVerifyStatus.Banned) {
            throw new ErrorWithStatus({ message: userMessage.USER_NOT_FOUND, status: httpStatus.NOT_FOUND })
        }
        // kiểm tra xem người get tweet này có trong tweet cirle không
        const user_id = req.decode_authorization.user_id
        const isInTweetCircle = author.twitter_circle.some((user_id_in_circle: ObjectId) => { if (user_id_in_circle.equals(user_id)) return true })
        if (!isInTweetCircle && !author._id.equals(user_id))
            throw new ErrorWithStatus({ status: httpStatus.FORBIDDEN, message: tweetMessage.TWEET_IS_NOT_PUBLIC })
    }
    next()
})
export const getTweetChildrenValidator = validate(checkSchema({
    tweet_type: {
        isIn: {
            options: [TweetType],
            errorMessage: tweetMessage.INVALID_TWEET_TYPE
        }
    },




}))
export const paginationValidator = validate(checkSchema({
    limit: {
        isNumeric: true,
        custom: {
            options: (value) => {
                const num = Number(value)
                if (num > 100 || num < 1) throw new Error('Limit is: 1<= limit <= 100')
                return true

            }
        }
    },
    page: {
        isNumeric: true,
        custom: {
            options: (value) => {
                const num = Number(value)
                if (num < 1) throw new Error('Page must >=1')
                return true

            }
        }
    }

}, ['query']))


export const searchValidator = validate(checkSchema({
    content: {
        isString: { errorMessage: 'content must be string' },
    },
    media_type: {
        optional: true,
        isIn: {
            options: [Object.values(MediaTypeQuery)],
            errorMessage: `media_type must be one of ${Object.values(MediaTypeQuery).join(', ')}`

        },
    },
    people_follow: {
        optional: true,
        isIn: {
            options: [Object.values(PeopleFollow)],
            errorMessage: `people_follow must be 0 or 1}`

        }
    }
}, ['query']))