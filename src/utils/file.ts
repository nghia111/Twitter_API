import fs from 'fs'
import path from 'path'

export const initFolder = (folderName : string)=>{
    const folderPath = path.resolve(folderName)
    if(!fs.existsSync(folderPath))
    {                             // mục đích là có thể tạo folder lồng vào nhau              
        fs.mkdirSync(folderPath, {recursive: true})
    }
}