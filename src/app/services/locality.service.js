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

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Region labels from `CountryRegionData` (e.g. "Telangana") often differ in casing
 * from stored Mongo `state` values (e.g. "TELANGANA"). Profile and game form both
 * call this; use case-insensitive matching so PIN lists load reliably.
 */
export const getPinCodesForState = async stateName => {
  await connectMongo()
  const raw = typeof stateName === 'string' ? stateName.trim() : ''
  console.log('state', raw)
  if (!raw) return null

  try {
    const foundState = await States.findOne(
      { state: new RegExp(`^${escapeRegex(raw)}$`, 'i') },
      { 'pinCodes.pincode': 1, _id: 0 }
    )
    const list = foundState?.pinCodes?.map(pinCodeObj => pinCodeObj?.pincode).filter(Boolean)
    return list?.length ? list : null
  } catch (error) {
    console.error('Error fetching  state pinCodes: ', error)
    return null
  }
}
