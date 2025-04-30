'use server'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export async function getAllAlerts() {
    const result = await RestApi.get(`${API_URLS.v0.ALERTS}`)
    return result
}

export async function getAlertById({ id }) {
    const result = await RestApi.get(`${API_URLS.v0.ALERTS}?id=${id}`)
    return result
}

export async function addAlert({ data }) {
    const result = await RestApi.post(`${API_URLS.v0.ALERTS}`, data)
    return result
}

export async function updateAlert({ id, data }) {
    const result = await RestApi.put(`${API_URLS.v0.ALERTS}`, { id, ...data })
    return result
}

export async function deleteAlert({ id }) {
    const result = await RestApi.del(`${API_URLS.v0.ALERTS}?id=${id}`)
    return result
}

