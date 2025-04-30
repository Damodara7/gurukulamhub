//A Request DTO (Data Transfer Object) is essentially a JavaScript object
//that defines the structure of data expected in a request.
//It acts as a blueprint for validating and shaping incoming data.

export const gameCreateRequestDto = {
  id: '',
  title: '',
  details: '',
  ownerId: '',
  editorIds:[],
  createdBy: '',
  privacy: '',
  nodeType: '',
  approvalState:"",
  status: '',
};

export const gameCreateRequestDto1 =
  {"id": "id",
    "title": "Quiz",
    "details": "Quiz Details",
    "owner": "system",
    "editorIds":[],
    "createdBy": "parsi.venkatramana@gmail.com",
    "privacy": "public",
    "contextIds": "369369369369369369369369",
    "nodeType": "QUIZ",
    "tags": [],
    "status": "active"
    }

