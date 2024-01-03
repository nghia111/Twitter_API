import { Request, Response } from "express"
import formidable from "formidable"
import path from "path"
import { ErrorWithStatus } from "~/models/Errors"
import { initFolder } from "~/utils/file"
export const uploadSingleImageController = async (req: Request, res: Response) => {    
    initFolder('uploads')                                                                                        //1000KB
    const form = formidable({ uploadDir: path.resolve('uploads'), maxFiles: 1, keepExtensions: true, maxFileSize: 1000 * 1024 ,
       filter: ({name,originalFilename,mimetype})=>{
        const valid = name ==='image' && Boolean( mimetype?.includes('image/'))
        if(!valid)
        form.emit('error' as any, new Error('File type is not valid') as any)
       return valid
    }
  })

      // cách viết 1

      form.parse(req, (err, fields, files) => {
        if(err)
          return res.status(err.httpCode).json({message: err.message,errInfo:err})
        if(!Boolean(files.image))
        return res.status(200).json({message:'value is empty'})

          else
        return res.json('thanh cong')})




  //     cách viết 2

  // const data= await new Promise((resolve,reject)=>{
  //   form.parse(req, (err, fields, files) => {
  //     if(err)
  //       return reject(err)
  //     else
  //     return resolve('thanh cong')
  //   });
  // })
  // return res.json(data)

}
