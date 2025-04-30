//A Request DTO (Data Transfer Object) is essentially a JavaScript object
//that defines the structure of data expected in a request.
//It acts as a blueprint for validating and shaping incoming data.

export const questionCreateRequestDto = {
  "id": "",
  "quizId": "",
  "isPrimary": "",
  "primaryQuestionId": "",
  "templateId": "",
  "language": {},
  "createdBy": "system",
  "status": "",
  "approvalState": "",
  "approvedBy": "",
  "schemaVersion": "1.0.0"
};
