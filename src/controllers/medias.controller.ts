import { Request, Response } from "express"
import path from "path"
import { userMessage } from "~/constants/message"
import { Media } from "~/models/schemas/Orther"
import { mediaService } from "~/services/media.service"

import { initFolder } from "~/utils/file"
export const uploadImageController = async (req: Request, res: Response) => {
    initFolder('uploads')
    initFolder('uploads/temp')
    const response = await mediaService.uploadfiles(req)
    res.json({
        message: userMessage.UPLOAD_SUCCESS,
        response
    })
}
export const serveImageController = (req: Request, res: Response) => {
    const { name } = req.params
    res.sendFile(path.resolve(`uploads/${name}`), (err) => {
        if (err)
            res.status((err as any).status).send('not found')
    })
}
