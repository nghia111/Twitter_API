import { ObjectId } from "mongodb";

interface hashtagType {
    _id?: ObjectId,
    name: string,
    created_at?: Date
}
export class Hashtag {
    _id?: ObjectId
    name: string
    created_at: Date
    constructor({ _id, name, created_at }: hashtagType) {
        this._id = _id || new ObjectId()
        this.name = name
        this.created_at = created_at || new Date()
    }
}