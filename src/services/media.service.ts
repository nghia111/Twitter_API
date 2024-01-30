import formidable from "formidable"
import path from "path"
import { Request } from 'express'
import { File } from 'formidable'
import sharp from "sharp"
import fs from 'fs'
import { isProduction } from "~/constants/config"
import { MediaType } from "~/constants/enums"
import { Media } from "~/models/schemas/Orther"
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR } from "~/constants/dir"
class MediaService {

    async uploadImage(req: Request) {
        const form = formidable({
            uploadDir: UPLOAD_IMAGE_TEMP_DIR, maxFiles: 4, keepExtensions: true, maxFileSize: 10000 * 1024,
            filter: ({ name, originalFilename, mimetype }) => {
                const valid = name === 'images' && Boolean(mimetype?.includes('image/'))
                if (!valid)
                    form.emit('error' as any, new Error('File type is not valid') as any)
                return valid
            }
        })
        // cách viết 1
        const files: File[] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err)
                    return reject(err)
                else
                    return resolve((files.images as File[]))
            });
        })

        //     cách viết 2
        //    form.parse(req, (err, fields, files) => {
        //      if(err)
        //         return res.status(err.httpCode).json({message: err.message,errInfo:err})
        //      if(!Boolean(files.files))
        //      return res.status(200).json({message:'value is empty'})

        //        else
        //      return res.json('thanh cong')
        // }
        // )
        // console.log(form)
        const results: Media[] = await Promise.all(files.map(async (file: File) => {
            const newName = file.newFilename.split('.')[0]
            const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
            await sharp(file.filepath).jpeg().toFile(newPath)
            // console.log(files.filepath)
            fs.unlinkSync(file.filepath)
            return {
                url: isProduction ? `${process.env.HOST}/static/image/${newName}.jpg` : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
                type: MediaType.Image
            }

        }))
        return results
    }


    async uploadVideo(req: Request) {
        const form = formidable({
            uploadDir: UPLOAD_VIDEO_TEMP_DIR, maxFiles: 1, keepExtensions: true, maxFileSize: 50 * 1024 * 1024,
            filter: ({ name, originalFilename, mimetype }) => {
                return true
            }
        })
        // cách viết 1
        const files: File[] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err)
                    return reject(err)
                else
                    return resolve((files.video as File[]))
            });
        })
        const { newFilename } = files[0]
        return {
            url: isProduction ? `${process.env.HOST}/static/video/${newFilename}` : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
            type: MediaType.Video
        }







    }

}
export const mediaService = new MediaService()


