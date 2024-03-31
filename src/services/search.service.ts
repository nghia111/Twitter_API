import { ObjectId } from "mongodb";
import { databaseService } from "./database.service";
import { MediaType, MediaTypeQuery, PeopleFollow, TweetType } from "~/constants/enums";

class SearchService {
    async search(content: string, page: number, limit: number, user_id: string, media_type?: MediaTypeQuery, people_follow?: PeopleFollow) {
        const filter: any = {
            '$text': {
                '$search': content
            },
        }
        if (media_type) {
            if (media_type == MediaTypeQuery.Image) {
                filter['medias.type'] = MediaType.Image
            } else {
                filter['medias.type'] = MediaType.Video
            }
        }
        if (people_follow && people_follow == PeopleFollow.Following) {
            const obj_user_id = new ObjectId(user_id)

            const followed_user_ids = await databaseService.getFollowersCollection().find({
                user_id: obj_user_id
            }, { projection: { followed_user_id: 1, _id: 0 } }).toArray()

            const ids = followed_user_ids.map((item) => { return item.followed_user_id })
            ids.push(obj_user_id)

            filter['user_id'] = {
                '$in': ids
            }
        }


        const tweets = await databaseService.getTweetsCollection().aggregate([
            {
                '$match': filter
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            }, {
                '$unwind': {
                    'path': '$user'
                }
            }, {
                '$match': {
                    '$or': [
                        {
                            'audience': 0
                        }, {
                            '$and': [
                                {
                                    'audience': 1
                                }, {
                                    'user.twitter_circle': {
                                        '$in': [
                                            new ObjectId(user_id)
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
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
                    }
                }
            }, {
                '$project': {
                    'tweet_children': 0,
                    'user': {
                        'password': 0,
                        'email_verify_token': 0,
                        'twitter_circle': 0,
                        'forgot_password_token': 0,
                        'date_of_birth': 0
                    }
                }
            }, {
                '$skip': limit * (page - 1)
            }, {
                '$limit': limit
            }
        ]).toArray()

        const tweet_ids = tweets.map(item => { return item._id as ObjectId })
        const [total] = await Promise.all([
            await databaseService.getTweetsCollection().aggregate([
                {
                    '$match': filter
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'user_id',
                        'foreignField': '_id',
                        'as': 'user'
                    }
                }, {
                    '$unwind': {
                        'path': '$user'
                    }
                }, {
                    '$match': {
                        '$or': [
                            {
                                'audience': 0
                            }, {
                                '$and': [
                                    {
                                        'audience': 1
                                    }, {
                                        'user.twitter_circle': {
                                            '$in': [
                                                new ObjectId(user_id)
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }, {
                    '$count': 'total'
                }

            ]).toArray(),
            await databaseService.getTweetsCollection().updateMany({
                _id: {
                    $in: tweet_ids
                }
            }, {
                $inc: { user_views: 1 }
            })])

        tweets.forEach(tweet => {
            tweet.user_views += 1
        })

        return { tweets, total: total[0]?.total || 0 }







    }
}

export const searchService = new SearchService()
