import { TweetAudience, TweetType } from "~/constants/enums";
import { Media } from "../schemas/Other";
import { ParamsDictionary, Query } from 'express-serve-static-core'
export interface TweetReqBody {
    type: TweetType,
    audience: TweetAudience,
    content: string,
    parent_id: null | string,
    hashtags: string[],
    mentions: string[],
    medias: Media[]
}
export interface TweetParams extends ParamsDictionary {
    tweet_id: string
}
export interface TweetQuery extends Pagination, Query {
    tweet_type: string
}
export interface Pagination extends Query {
    limit: string,
    page: string,
}