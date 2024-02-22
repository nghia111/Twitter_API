import { TweetReqBody } from "~/models/requests/tweet.request";
import { databaseService } from "./database.service";
import Tweet from "~/models/schemas/Tweet.schema";
import { ObjectId, WithId } from "mongodb";
import { Hashtag } from "~/models/schemas/Hashtag.schema";

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
}


export const tweetService = new TweetService()