import * as yup from 'yup';


const languageSchema = yup.object({
  code: yup.string().required().trim(),
  name: yup.string().required().trim()
});


export const quizCreateRequestDtoSchema = yup.object({
  id: yup.string(),
  title: yup.string().required('Title is required'),
  details: yup.string(),
  owner: yup.string(),
  approvedBy: yup.string(),
  editorIds: yup.array().of(yup.string()),
  approvalState: yup.string(),
  thumbnail: yup.string(),
  remarks: yup.array().of(yup.string()),
  createdBy: yup.string(),
  privacy: yup.string(),
  contextIds: yup.array().of(yup.string()).required('context Ids is required'),
  nodeType: yup.string(),
  tags: yup.array().of(yup.string()), // Assuming tags is an array of strings
  status: yup.string(),
  language: languageSchema
});


export function validateQuizQuestions(questions) {
  const errors = []

  questions.forEach(question => {
    const questionErrors = []
    const { _id, templateId, data } = question
    const questionId = _id || question.id // Fallback to id if _id doesn't exist

    // Common validation for all question types
    if (!data?.question) {
      questionErrors.push({
        questionId,
        field: 'question',
        message: 'Missing question data'
      })
    } else {
      // Validate question media content based on mediaType
      const { mediaType, text, image, video } = data?.question
      switch (mediaType) {
        case 'text':
          if (!text?.trim())
            questionErrors.push({
              questionId,
              field: 'question.text',
              message: 'Text is required'
            })
          break
        case 'image':
          if (!image)
            questionErrors.push({
              questionId,
              field: 'question.image',
              message: 'Image is required'
            })
          break
        case 'video':
          if (!video)
            questionErrors.push({
              questionId,
              field: 'question.video',
              message: 'Video is required'
            })
          break
        case 'text-image':
          if (!text?.trim())
            questionErrors.push({
              questionId,
              field: 'question.text',
              message: 'Text is required'
            })
          if (!image)
            questionErrors.push({
              questionId,
              field: 'question.image',
              message: 'Image is required'
            })
          break
        case 'text-video':
          if (!text?.trim())
            questionErrors.push({
              questionId,
              field: 'question.text',
              message: 'Text is required'
            })
          if (!video)
            questionErrors.push({
              questionId,
              field: 'question.video',
              message: 'Video is required'
            })
          break
        default:
          if (templateId !== 'fill-in-blank') {
            questionErrors.push({
              questionId,
              field: 'question.mediaType',
              message: 'Invalid mediaType'
            })
          }
      }
    }

    // Template-specific validation
    switch (templateId) {
      case 'single-choice':
      case 'multiple-choice':
        if (!data?.options || data?.options.length < 2) {
          questionErrors.push({
            questionId,
            field: 'options',
            message: 'At least 2 options are required'
          })
        } else {
          let correctOptions = 0
          data?.options.forEach(option => {
            // Validate option media content
            switch (option.mediaType) {
              case 'text':
                if (!option.text?.trim() && !option.image) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}`,
                    message: 'Either text or image is required for this option'
                  })
                } else if (!option.text?.trim()) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}.text`,
                    message: 'Text is required for text options'
                  })
                }
                break

              case 'image':
                if (!option.text?.trim() && !option.image) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}`,
                    message: 'Either text or image is required for this option'
                  })
                } else if (!option.image) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}.image`,
                    message: 'Image is required for image options'
                  })
                }
                break

              default:
                // For any other case (including undefined mediaType), require at least text or image
                if (!option.text?.trim() && !option.image) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}`,
                    message: 'Either text or image is required for this option'
                  })
                }
            }

            if (option.correct) correctOptions++
          })

          if (templateId === 'single-choice' && correctOptions !== 1) {
            questionErrors.push({
              questionId,
              field: 'options',
              message: 'Exactly one correct option required for single-choice'
            })
          }
          if (templateId === 'multiple-choice' && correctOptions < 1) {
            questionErrors.push({
              questionId,
              field: 'options',
              message: 'At least one correct option required for multiple-choice'
            })
          }
        }
        break

      case 'true-or-false':
        if (!data?.options || data?.options.length !== 2) {
          questionErrors.push({
            questionId,
            field: 'options',
            message: 'True/False questions must have exactly 2 options'
          })
        } else {
          let correctOptions = 0
          data?.options.forEach(option => {
            // Validate option media content
            switch (option.mediaType) {
              case 'text':
                if (!option.text?.trim() && !option.image) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}`,
                    message: 'Either text or image is required for this option'
                  })
                } else if (!option.text?.trim()) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}.text`,
                    message: 'Text is required for text options'
                  })
                }
                break

              case 'image':
                if (!option.text?.trim() && !option.image) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}`,
                    message: 'Either text or image is required for this option'
                  })
                } else if (!option.image) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}.image`,
                    message: 'Image is required for image options'
                  })
                }
                break

              default:
                // For any other case (including undefined mediaType), require at least text or image
                if (!option.text?.trim() && !option.image) {
                  questionErrors.push({
                    questionId,
                    field: `options.${option.id}`,
                    message: 'Either text or image is required for this option'
                  })
                }
            }

            if (option.correct) correctOptions++
          })

          if (correctOptions !== 1) {
            questionErrors.push({
              questionId,
              field: 'options',
              message: 'Exactly one correct option required for true-or-false'
            })
          }
        }
        break

      case 'fill-in-blank':
        if (!data?.question || !Array.isArray(data?.question)) {
          questionErrors.push({
            questionId,
            field: 'question',
            message: 'Fill-in-blank requires question parts array'
          })
        } else {
          const hasBlank = data?.question.some(part => part.type === 'blank')
          if (!hasBlank) {
            questionErrors.push({
              questionId,
              field: 'question',
              message: 'Fill-in-blank requires at least one blank part'
            })
          }

          data?.question.forEach(part => {
            if (!part.content?.trim()) {
              questionErrors.push({
                questionId,
                field: `question.${part.id}.content`,
                message: 'Content is required'
              })
            }
          })
        }
        break

      default:
        questionErrors.push({
          questionId,
          field: 'templateId',
          message: 'Invalid templateId'
        })
    }

    // Validate marks
    if (typeof data?.marks !== 'number' || data?.marks <= 0) {
      questionErrors.push({
        questionId,
        field: 'marks',
        message: 'Valid marks value required'
      })
    }

    // Validate timer
    if (typeof data?.timerSeconds !== 'number' || data?.timerSeconds <= 0) {
      questionErrors.push({
        questionId,
        field: 'timerSeconds',
        message: 'Valid timer value required'
      })
    }

    if (questionErrors.length > 0) {
      errors.push(...questionErrors)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

