import connectMongo from '@/utils/dbConnect-mongo'
// import VillageLocalityZip from '@/app/models/villagelocalityzips.model'
// import States from '@/app/models/state.model'
import States from '@/app/models/state-and-pincodes-and-locality.model'

export const getLocality = async ( pinCode) => {
  await connectMongo()
  console.log('PinCode', pinCode)
  try {
    const foundState = await States.findOne(
      { 'pinCodes.pincode': pinCode }, // Find the state that contains the pincode
      { 'pinCodes.$': 1 } // Project only the matched pincode's data
    );
    return foundState?.pinCodes[0].localities
  } catch (error) {
    console.error('Error fetching pinCode: ', error)
    return null
  }
}

export const getPinCodesForState = async (stateName) => {
  await connectMongo()
  console.log('state', stateName)
  try {
    const foundState = await States.findOne(
      { state: stateName }, // Find the document for the given state
      { 'pinCodes.pincode': 1, _id: 0 } // Project only the pincode field, exclude _id
    )
    return foundState?.pinCodes.map(pinCodeObj=> pinCodeObj.pincode)
  } catch (error) {
    console.error('Error fetching  state pinCodes: ', error)
    return null
  }
}
