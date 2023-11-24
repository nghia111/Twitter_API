import bcrypt from "bcryptjs"

export const hashPassword = (password: string) => bcrypt.hashSync(password, bcrypt.genSaltSync(Number(process.env.AMOUNT_OF_SALT)))
export const comparePassword = (password1: string, password2: string) => bcrypt.compareSync(password1, password2)