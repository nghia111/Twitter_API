import { TweetReqBody } from "~/models/requests/tweet.request";
import { databaseService } from "./database.service";
import Tweet from "~/models/schemas/Tweet.schema";
import { ObjectId, WithId } from "mongodb";
import { Hashtag } from "~/models/schemas/Hashtag.schema";
import { Bookmark } from "~/models/schemas/Bookmark.schema";
import { Like } from "~/models/schemas/Like.schema";
import { TweetType } from "~/constants/enums";

class TweetService {

    async createHashtag(hashtags: string[]) {
        const hashtagDocuments = await Promise.all(hashtags.map(hashtag => {
            return databaseService.getHashtagsCollection().findOneAndUpdate(
                { name: hashtag },
                {
                    $setOnInsert: new Hashtag({ name: hashtag })
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }


            )
        }))
        return hashtagDocuments
            .map(hashtag => hashtag?._id)
            .filter(id => id !== undefined) as ObjectId[];
    }

    /////////////////////////////////////
    async createTweet(body: TweetReqBody, user_id: string) {
        const hashtags = await this.createHashtag(body.hashtags)

        const response = await databaseService.getTweetsCollection().insertOne(new Tweet({
            audience: body.audience,
            content: body.content,
            hashtags,
            mentions: body.mentions,
            medias: body.medias,
            parent_id: body.parent_id,
            type: body.type,
            user_id: new ObjectId(user_id)
        }))
        const tweet = await databaseService.getTweetsCollection().findOne({ _id: response.insertedId })
        return tweet
    }

    /////////////////////////////////////
    async bookmarkTweet(tweet_id: string, user_id: string) {
        const response = await databaseService.getBookmarksCollection().findOneAndUpdate(
            {
                user_id: new ObjectId(user_id),
                tweet_id: new ObjectId(tweet_id)
            },
            { $setOnInsert: new Bookmark({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) }) },
            {
                upsert: true,
                returnDocument: 'after'
            }

        )
        return response as WithId<Bookmark>
    }

    async unbookmarkTweet(tweet_id: string, user_id: string) {
        const response = await databaseService.getBookmarksCollection().findOneAndDelete(
            {
                user_id: new ObjectId(user_id),
                tweet_id: new ObjectId(tweet_id)
            }

        )
        return response as WithId<Bookmark>
    }

    async likeTweet(tweet_id: string, user_id: string) {
        const response = await databaseService.getLikesCollection().findOneAndUpdate(
            {
                user_id: new ObjectId(user_id),
                tweet_id: new ObjectId(tweet_id)
            },
            { $setOnInsert: new Like({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) }) },
            {
                upsert: true,
                returnDocument: 'after'
            }

        )
        return response as WithId<Like>
    }

    async unlikeTweet(tweet_id: string, user_id: string) {
        const response = await databaseService.getLikesCollection().findOneAndDelete(
            {
                user_id: new ObjectId(user_id),
                tweet_id: new ObjectId(tweet_id)
            }

        )
        return response as WithId<Like>
    }

    async increaseView(tweet_id: ObjectId, user_id: string | undefined) {
        if (!user_id) {
            const response = await databaseService.getTweetsCollection().findOneAndUpdate({ _id: tweet_id }, {
                $inc: { guest_views: 1 }
            }, {
                returnDocument: 'after',
            })
            return response

        } else {
            const response = await databaseService.getTweetsCollection().findOneAndUpdate({ _id: tweet_id }, {
                $inc: { user_views: 1 }
            }, {
                returnDocument: 'after',
            })
            return response
        }
    }

    async getTweetChildren(tweet_id: string, type: TweetType, page: number, limit: number, user_id: string | undefined) {
        const tweets = await databaseService.getTweetsCollection().aggregate([
            {
                '$match': {
                    'parent_id': new ObjectId(tweet_id),
                    'type': type
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
            }, {
                '$skip': limit * (page - 1)   // công thức phân trang
            }, {
                '$limit': limit
            }
        ]).toArray()
        const ids = tweets.map(tweet => { return tweet._id as ObjectId })
        const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

        const [total] = await Promise.all([await databaseService.getTweetsCollection().countDocuments({
            parent_id: new ObjectId(tweet_id),
            type
        }), await databaseService.getTweetsCollection().updateMany({
            _id: {
                $in: ids
            }
        }, {
            $inc: inc
        })])

        tweets.forEach(tweet => {
            if (user_id) {
                tweet.user_views += 1
            } else {
                tweet.guest_views += 1
            }
        })
        return { tweets, total }
    }
}

export const tweetService = new TweetService()