import formidable from "formidable"
import path from "path"
import { Request } from 'express'
import { File } from 'formidable'
import sharp from "sharp"
import fs from 'fs'
class MediaService {
    async handleUploadSingleImage(req: Request) {
        const form = formidable({
            uploadDir: path.resolve('uploads/temp'), maxFiles: 1, keepExtensions: true, maxFileSize: 10000 * 1024,
            filter: ({ name, originalFilename, mimetype }) => {
                const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
                if (!valid)
                    form.emit('error' as any, new Error('File type is not valid') as any)
                return valid
            }
        })
        // cách viết 1
        const image: File = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err)
                    return reject(err)
                else
                    return resolve((files.image as File[])[0])
            });
        })
        //     cách viết 2
        //    form.parse(req, (err, fields, files) => {
        //      if(err)
        //         return res.status(err.httpCode).json({message: err.message,errInfo:err})
        //      if(!Boolean(files.image))
        //      return res.status(200).json({message:'value is empty'})

        //        else
        //      return res.json('thanh cong')
        // }
        // )
        const newName = image.newFilename.split('.')[0]
        const imageAfterHandling = await sharp(image.filepath).jpeg().toFile(path.resolve(`uploads/${newName}.jpg`))
        console.log(image.filepath)
        fs.unlinkSync(image.filepath)
        return `http://localhost:3000/uploads/${newName}.jpg`


    }

}
export const mediaService = new MediaService()