export const excludeQuesstionChars = [
  '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '{', '}', '|', '"', '<', '>', '/', "'", ';', '[', ']', '\\', '`' ]

// Exclude these chars from the question text

export const excludeBlankChars = [
  '`', '~', '!', '@', '#', '$', '%', '^', '&', '*',  '(', ')', '_', '+', '=', '|', '\\', '{', '}', '[', ']', '"', "'", ':', ';', '<', '>', '/', '?' ];
//Removes ALL spaces and other unwanted chars


export const excludesTextChars = ['~', '`', '@', '#', '$', '^', '&', '_', '|', '\\', ':', ';', '[', ']', '{', '}']

// Exclude these chars from the question text
 

export const filterInput = (value, charArr) => {
  if (!value) return '' // Handle null/undefined

  return Array.from(value) // Convert to array to handle Unicode characters properly
    .filter(char => !charArr.includes(char)) // Keep characters not in the exclusion list
    .join('') // Combine back into string
}
