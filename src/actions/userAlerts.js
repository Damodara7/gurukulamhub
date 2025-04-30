'use server'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export async function getAllUserAlerts() {
    const result = await RestApi.get(`${API_URLS.v0.USER_ALERTS}`)
    return result
}

export async function getUserWithAlertsByEmail({ email }) {
    const result = await RestApi.get(`${API_URLS.v0.USER_ALERTS}?email=${email}`)
    return result
}

export async function getAlertUsersByAlertId({ alertId }) {
    const result = await RestApi.get(`${API_URLS.v0.USER_ALERTS}?alertId=${alertId}`)
    return result
}

export async function addUserAlert({ data }) {
    const result = await RestApi.post(`${API_URLS.v0.USER_ALERTS}`, data)
    return result
}

export async function updateUserAlert({ email, data }) {
    const result = await RestApi.put(`${API_URLS.v0.USER_ALERTS}`, { email, ...data })
    return result
}

export async function updateUserAlertByAlertId({ email, alertId, data }) {
    const result = await RestApi.put(`${API_URLS.v0.USER_ALERTS}`, { email, alertId, ...data })
    return result
}

export async function deleteUserAlert({ id }) {
    const result = await RestApi.del(`${API_URLS.v0.USER_ALERTS}?id=${id}`)
    return result
}

