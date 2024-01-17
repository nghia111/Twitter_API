import formidable from "formidable"
import path from "path"
import { Request } from 'express'
import { File } from 'formidable'
import sharp from "sharp"
import fs from 'fs'
import { isProduction } from "~/constants/config"
import { MediaType } from "~/constants/enums"
import { Media } from "~/models/schemas/Orther"
class MediaService {
    async uploadfiles(req: Request) {
        const form = formidable({
            uploadDir: path.resolve('uploads/temp'), maxFiles: 4, keepExtensions: true, maxFileSize: 10000 * 1024,
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
        const results : Media[] = await Promise.all(files.map(async (file : File)=>{
            const newName = file.newFilename.split('.')[0]
            const filesAfterHandling = await sharp(file.filepath).jpeg().toFile(path.resolve(`uploads/${newName}.jpg`))
            // console.log(files.filepath)
            fs.unlinkSync(file.filepath)
            return {
                url: isProduction ? `${process.env.HOST}/uploads/${newName}.jpg` : `http://localhost:${process.env.PORT}/static/files/${newName}.jpg`,
                type: MediaType.Image
        }

        }))
        return results


       

     



    }

}
export const mediaService = new MediaService()


