export const questionRegex = /[^a-zA-Z0-9.,?]/g // Removes ALL spaces and other unwanted chars

export const blankRegex = /[^a-zA-Z0-9\-]/g

export const textRegex = /[^a-zA-Z0-9 ?+\-=*/()<>!., ]/g

export const filterInput = (value, regex) => {
  return value.trim().replace(regex, '') // First trim, then remove unwanted chars
}
