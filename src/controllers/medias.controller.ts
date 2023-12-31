import { Request, Response } from "express"
import formidable from "formidable"
import path from "path"
export const uploadSingleImageController = async (req: Request, res: Response) => {                                 //300KB
    const form = formidable({ uploadDir: path.resolve('uploads'), maxFiles: 1, keepExtensions: true, maxFileSize: 1000 * 1024 })
    form.parse(req, (err, fields, files) => {
        if (err) {
            throw err
        }
        res.json({
            message: 'hehe'
        })
    })





}
