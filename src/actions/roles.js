import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export async function getNormalRoles() {
    const result = await RestApi.get(`${API_URLS.v0.ROLES}`);
    return result
}

export async function getGeoRoles() {
    const result = await RestApi.get(`${API_URLS.v0.GEO_ROLES}`);
    return result
}
