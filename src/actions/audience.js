'use server'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export async function getAllAudiences() {
    const result = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}`)
    return result
}

export async function getAudienceById({ id }) {
    const result = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}?id=${id}`)
    return result
}

export async function addAudience({ data }) {
    const result = await RestApi.post(`${API_URLS.v0.USERS_AUDIENCE}`, data)
    return result
}

export async function updateAudience({ id, data }) {
    const result = await RestApi.put(`${API_URLS.v0.USERS_AUDIENCE}`, { _id: id, ...data })
    return result
}

export async function deleteAudience({ id }) {
    const result = await RestApi.del(`${API_URLS.v0.USERS_AUDIENCE}?id=${id}`)
    return result
}

