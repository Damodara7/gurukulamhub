'use server'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

export async function getAllLearningsForAllUsers() {
    const result = await RestApi.get(`${API_URLS.v0.USER_LEARNING}`)
    return result
}

export async function getUserLearningsByEmail({ email }) {
    const result = await RestApi.get(`${API_URLS.v0.USER_LEARNING}?email=${email}`)
    return result
}

export async function addLearingRecordsForUser({ email, data }) {
    const result = await RestApi.post(`${API_URLS.v0.USER_LEARNING}`, { email, data })
    return result
}
