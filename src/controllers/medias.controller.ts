import { Request, Response } from "express"
import path from "path"
import { userMessage } from "~/constants/message"
import { mediaService } from "~/services/media.service"

import { initFolder } from "~/utils/file"
export const uploadSingleImageController = async (req: Request, res: Response) => {
    initFolder('uploads')
    initFolder('uploads/temp')
    const response = await mediaService.handleUploadSingleImage(req)
    res.json({
        message: userMessage.UPLOAD_SUCCESS,
        url: response
    })
}
export const serveImageController = (req: Request, res: Response) => {
    const { name } = req.params
    res.sendFile(path.resolve(`uploads/${name}`), (err) => {
        if (err)
            res.status((err as any).status).send('not found')
    })
}
