import { User } from "~/models/schemas/User.schema";
import { databaseService } from "./database.service";

class UserService {

    async register(payload: { email: string, password: string }) {
        const { email, password } = payload
        const response = await databaseService.getUsersCollection().insertOne(new User({
            email,
            password
        }))
        return response
    }
}
export const userService = new UserService()