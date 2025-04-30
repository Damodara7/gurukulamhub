'use server'

import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'

export async function approveQuiz(reqBody) {
    try {
      const result = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, reqBody)
      if (result.status === 'success') {
        return result
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      throw new Error(error?.message)
    }
  }
  
  export async function rejectQuiz(reqBody) {
    try {
      const result = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, reqBody)
      if (result.status === 'success') {
        return result
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      throw new Error(error?.message)
    }
  }
  
  export async function moveQuizToPending(reqBody) {
    try {
      const result = await RestApi.put(`${API_URLS.v0.USERS_QUIZ}`, reqBody)
      if (result.status === 'success') {
        return result
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      throw new Error(error?.message)
    }
  }
