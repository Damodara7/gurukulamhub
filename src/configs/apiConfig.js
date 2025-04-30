import { API_URLS as devUrls, API_BASE_URL as devBaseUrl } from './apiConfig.dev'
import { API_URLS as prodUrls, API_BASE_URL as prodBaseUrl } from './apiConfig.prod'

const isProduction = process.env.NODE_ENV === 'production'

export const API_URLS = isProduction ? prodUrls : devUrls
export const API_BASE_URL = isProduction ? prodBaseUrl : devBaseUrl
