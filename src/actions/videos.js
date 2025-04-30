'use server'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export async function getAllVideos() {
    const result = await RestApi.get(`${API_URLS.v0.VIDEOS}`)
    return result
}

export async function getVideoById({ id }) {
    const result = await RestApi.get(`${API_URLS.v0.VIDEOS}?id=${id}`)
    return result
}

export async function addVideo({ data }) {
    const result = await RestApi.post(`${API_URLS.v0.VIDEOS}`, data)
    return result
}

export async function updateVideo({ id, data }) {
    const result = await RestApi.put(`${API_URLS.v0.VIDEOS}`, { id, ...data })
    return result
}

export async function deleteVideo({ id }) {
    const result = await RestApi.del(`${API_URLS.v0.VIDEOS}?id=${id}`)
    return result
}
