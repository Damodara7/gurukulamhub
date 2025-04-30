import * as yup from 'yup';



export const gameStatusCreateRequestDtoSchema = yup.object({
  _id: yup.string(),
  gameId: yup.string().required('gameId is required'),
  startDate: yup.string(),   
  status: yup.string(),
  gameStatus: yup.string(),
  privacy: yup.string(),
  owner:yup.string(),
});

