
import { MongoClient } from 'mongodb'

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.79ga7nh.mongodb.net/?retryWrites=true&w=majority`;


class DatabaseService {
    private client: MongoClient
    constructor() {
        this.client = new MongoClient(uri);
    }
    async connect() {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await this.client.connect();
            // Send a ping to confirm a successful connection
            await this.client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } finally {
            // Ensures that the client will close when you finish/error
            await this.client.close();
        }
    }
}
// tạo object từ class
export const databaseService = new DatabaseService()



