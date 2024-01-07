import argv from 'minimist'
export const option = argv(process.argv.slice(2))
export const isProduction = Boolean(option.production)