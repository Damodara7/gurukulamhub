export type CreateOrUpdateProfileDto = {
  email: string
  bio?: string
  website?: string
  firstname?: string
  lastname?: string
  referredBy?: string
  country?: string
  region?: String, //state
  zipcode?: string
  phone?: string
  phone2?: string
  phoneCountryCode?: string
  phone2CountryCode?: string
  coordinates?: {
    longitude: number
    latitude: number
  }
  friends: string[]
}
