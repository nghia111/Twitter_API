import { Request, Response, response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { PeopleFollow } from '~/constants/enums'
import { SearchQuery } from '~/models/requests/search.request'
import { searchService } from '~/services/search.service'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const content = req.query.content ?? '';
    const user_id = req.decode_authorization?.user_id as string
    const media_type = req.query.media_type
    const people_follow = req.query.people_follow as PeopleFollow;
    const response = await searchService.search(content, page, limit, user_id, media_type, people_follow)
    const result = {
        tweets: response.tweets,
        limit,
        page,
        total_page: Math.ceil(response.total / limit)
    }

    res.json({
        message: "Search Successfully",
        result
    })
}