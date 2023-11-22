
import { Collection, Db, MongoClient } from 'mongodb'
import { User } from '~/models/schemas/User.schema';

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
    getUsersCollection(): Collection<User> {
        return this.db.collection('users')
    }
}
// tạo object từ class
export const databaseService = new DatabaseService()



