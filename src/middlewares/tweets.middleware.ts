import { checkSchema } from "express-validator";
import { isEmpty, isString } from "lodash";
import { ObjectId } from "mongodb";
import { MediaType, TweetAudience, TweetType } from "~/constants/enums";
import { tweetMessage } from "~/constants/message";
import { ErrorWithStatus } from "~/models/Errors";
import { databaseService } from "~/services/database.service";
import { numberEnumToArray } from "~/utils/other";
import { validate } from "~/utils/validation";

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
            options: async (value) => {
                if (!ObjectId.isValid(value)) {
                    throw new Error("tweet_id is invalid a ObjectId type")
                }
                const tweet = await databaseService.getTweetsCollection().findOne({ _id: new ObjectId(value) })
                if (!tweet) {
                    throw new Error("Tweet Not Found")
                }
                return true
            }
        }
    }
}))