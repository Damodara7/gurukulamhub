import * as yup from 'yup';



export const gameCreateRequestDtoSchema = yup.object({
  _id: yup.string(),
  gamePin: yup.string().required('GamePin is required'),
  title: yup.string().required('Title is required'),
  details: yup.string(),
  startDate: yup.string(),
  slogan: yup.string(),
  owner: yup.string(),
  thumbnailUrl: yup.string(),
  sponsorName:yup.string(),
  sponsorPhone:yup.string(),
  sponsorWebSite: yup.string(),
  quizId: yup.string(),
  totalRewardsValue: yup.string(),
  status: yup.string(),
  gameStatus: yup.string(),
});

