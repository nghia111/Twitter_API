
import { Collection, Db, MongoClient } from 'mongodb'
import { Follower } from '~/models/schemas/Follower.schema';
import { RefreshToken } from '~/models/schemas/RefreshToken.schema';
import Tweet from '~/models/schemas/Tweet.schema';
import { User } from '~/models/schemas/User.schema';
import { Hashtag } from '~/models/schemas/Hashtag.schema';
import { Bookmark } from '~/models/schemas/Bookmark.schema';

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.79ga7nh.mongodb.net/?retryWrites=true&w=majority`;


class DatabaseService {
    private client: MongoClient
    private db: Db


    constructor() {
        this.client = new MongoClient(uri);
        this.db = this.client.db(process.env.DB_NAME)

    }
    async connect() {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await this.client.connect();
            // Send a ping to confirm a successful connection
            await this.db.command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } catch (error) {
            console.log(error)
        }
    }



    //
    getUsersCollection(): Collection<User> {
        return this.db.collection(process.env.DB_USERS_COLLECTION as string)
    }
    getRefreshTokenCollection(): Collection<RefreshToken> {
        return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
    }
    getFollowersCollection(): Collection<Follower> {
        return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
    }
    getTweetsCollection(): Collection<Tweet> {
        return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
    }
    getHashtagsCollection(): Collection<Hashtag> {
        return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
    }
    getBookmarksCollection(): Collection<Bookmark> {
        return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
    }


    //

}




// tạo object từ class
export const databaseService = new DatabaseService()



