// 'use server'
import axios from 'axios'
import * as APIConfig from '../configs/apiConfig'

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: APIConfig.API_URLS.API_BASE_URL, // Replace with your API base URL
  timeout: 50000, // Timeout in milliseconds
  headers: {
    'Content-Type': 'application/json'
    // You can add any default headers here
  }
})

// Utility method for making GET requests
export const get = async (url, params = {}) => {
  try {
    console.log('GET', url, params)
    const response = await axiosInstance.get(url, { params })
    return response.data
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message)
    } else if (error.response) {
      console.error('Server error:', error.response.data)
    } else {
      console.error('Network error:', error.message)
    }
    return error?.response?.data
    // throw new Error(error?.message);
  }
}

// Utility method for making PATCH requests
export const patch = async (url, data = {}) => {
  try {
    const response = await axiosInstance.patch(url, data)
    return response.data
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.message)
    } else if (error.response) {
      console.error('Server error:', error.response.data)
    } else {
      console.error('Network error:', error.message)
    }
    return error?.response?.data
  }
}

// Utility method for making POST requests
export const post = async (url, data = {}) => {
  try {
    const response = await axiosInstance.post(url, data, { withCredentials: true })
    // console.log('Response status: ', response.status)
    // console.log('Response Data: ', response.data)
    return response.data
  } catch (error) {
    console.error('Error:', error?.message)
    return error?.response?.data
    // Handle error
    //throw new Error(error?.message);
    // alert("Fatal Error during api call");
  }
}

// Utility method for making PUT requests
export const put = async (url, data = {}) => {
  try {
    const response = await axiosInstance.put(url, data)
    return response.data
  } catch (error) {
    console.error('Error', error?.message)
    return error?.response?.data
    // Handle error
    //throw new Error(error.message);
    //alert("Fatal Error during api call");
  }
}

// Utility method for making DELETE requests
export const del = async (url, data = {}) => {
  try {
    const response = await axiosInstance.delete(url, { data })
    return response.data
  } catch (error) {
    // Handle error
    throw new Error(error.message)
  }
}

// Create an Axios instance with default configuration
const axiosFormInstance = axios.create({
  baseURL: APIConfig.API_URLS.API_BASE_URL, // Replace with your API base URL
  timeout: 5000 // Timeout in milliseconds
})

export const submitFormData = async (url, formData) => {
  try {
    // Send POST request with formData
    const response = await axiosFormInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    throw new Error(error.message)
  }
}

export const uploadMultipleFiles = async (url, files) => {
  try {
    const formData = new FormData()

    // Append each file to the formData object
    files.forEach((file, index) => {
      formData.append(`file${index}`, file)
    })

    // Send POST request with formData
    const response = await axiosFormInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    throw new Error(error.message)
  }
}
