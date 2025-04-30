//A Request DTO (Data Transfer Object) is essentially a JavaScript object
//that defines the structure of data expected in a request.
//It acts as a blueprint for validating and shaping incoming data.

export const contextCreateRequestDto = {
  id: '',
  name: '',
  details: '',
  ownerId: '',
  createdBy: '',
  privacy: '',
  parentContextId: '',
  "parentContextObjectId":"",
  contextType: '',
  tags: [], // Assuming tags is an array of strings
  status: '',
};

export const contextCreateRequestDto1 =
  {"id": "id",
    "name": "Context Name",
    "details": "Context Details",
    "createdBy": "parsi.venkatramana@gmail.com",
    "parentContextObjectId":"",
    "parentContextId": "369369369369369369369369",
    "contextType": "SUBJECT",
    "tags": [],
    "status": "active"
    }

