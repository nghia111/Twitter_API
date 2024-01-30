import { Request, Response } from "express"
import path from "path"
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from "~/constants/dir"
import { userMessage } from "~/constants/message"

import { mediaService } from "~/services/media.service"

import { initFolder } from "~/utils/file"
export const uploadImageController = async (req: Request, res: Response) => {
    initFolder('uploads/images')
    initFolder('uploads/images/temp')
    const response = await mediaService.uploadImage(req)
    res.json({
        message: userMessage.UPLOAD_SUCCESS,
        response
    })
}
// chưa làm upload video
export const uploadVideoController = async (req: Request, res: Response) => {
    initFolder('uploads/videos')
    initFolder('uploads/videos/temp')
    const response = await mediaService.uploadVideo(req)
    res.json({
        message: userMessage.UPLOAD_SUCCESS,
        response
    })
}

export const serveImageController = (req: Request, res: Response) => {
    const { name } = req.params
    res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
        if (err)
            res.status((err as any).status).send('not found')
    })
}
export const serveVideoController = (req: Request, res: Response) => {
    const { name } = req.params
    res.sendFile(path.resolve(UPLOAD_VIDEO_TEMP_DIR, name), (err) => {
        if (err)
            if (!res.headersSent) {
                res.status((err as any).status).send('not found')
            }
    })
}
