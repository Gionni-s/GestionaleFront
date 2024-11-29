export const removeDuplicate = (array: any[]) => {
  const newArray = []
  for (var i = 0; i < array.length; i++) {
    if (newArray.indexOf(array[i]) === -1) {
      newArray.push(array[i])
    }
  }
  return newArray
}
