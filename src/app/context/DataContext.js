import { createContext, useState, useEffect}
from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig';

const testTreeData = [
  {
    title: 'AUM', id:"AUM",
    children: [
      {title:"My Quizzes",id:`${user.email}`},
      {title:"Modern Science", id:"AUM_MSC" ,children:[{title:"Maths", id:"AUM_MSC_MTH"}]},
      {title:"Vedic Science", id:"AUM_VSC", children:[{title:"Ganitham", id:"AUM_VSC_GNT"}]},
      {title:"History", id:"AUM_HIS" , children:[{title:"Religion", id:"AUM_HIS_REL",
         children:[{title:"Hinduism" ,id:"AUM_HIS_REL_HIN", children:[{title:"Ramayana", id:"AUM_HIS_REL_HIN_RAM"},{title:"Mahabharata",id:"AUM_HIS_REL_HIN_MHB"}]},{title:"Judaism",id:"AUM_HIS_REL_JUD"},{title:"Islam",id:"AUM_HIS_REL_ISL"}]}]} ,
    ],
  },
]

const DataContext = createContext({});

export const DataProvider = ({ children }) => {

  const [quizId, setQuizId] = useState('');
  const [treeData, setTreeData] = useState([]);

  //const []

  return (
    <DataContext.Provider value ={{
      quizId, setQuizId, treeData, setTreeData,
      }}>
     {children}
     </DataContext.Provider>
  )
}

export default DataContext;
