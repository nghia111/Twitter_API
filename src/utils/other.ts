export const numberEnumToArray = (enumObj: { [key: string]: string | number }) => {
    let numberEnumArr = []
    for (let key in enumObj) {
        if (typeof enumObj[key] === 'number')
            numberEnumArr.push(enumObj[key])
    }
    return numberEnumArr
}