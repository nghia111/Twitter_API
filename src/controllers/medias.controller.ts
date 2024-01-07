import { Request, Response } from "express"
import { mediaService } from "~/services/media.service"

import { initFolder } from "~/utils/file"
export const uploadSingleImageController = async (req: Request, res: Response) => {
    initFolder('uploads')
    initFolder('uploads/temp')
    const response = await mediaService.handleUploadSingleImage(req)
    res.json(response)
}
