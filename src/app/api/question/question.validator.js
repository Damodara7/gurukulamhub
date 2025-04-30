import * as yup from 'yup';


const languageSchema = yup.object({
  code: yup.string().required().trim(),
  name: yup.string().required().trim()
});


export const questionCreateRequestDtoSchema = yup.object({
  id: yup.string(),
  quizId: yup.string(),
  isPrimary: yup.boolean(),
  primaryQuestionId: yup.string(),
  templateId: yup.string(),
  language:yup.string(),
  createdBy: yup.string(),
  status:yup.string(),
  approvalState: yup.string(),
  approvedBy: yup.string(),
  schemaVersion: yup.string(),
});

