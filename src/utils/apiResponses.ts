//import { navigateToRoute } from './apiResponses';
//// utils/apiResponses.ts

//By abstracting response handling into utility functions,
//your code becomes more organized and maintainable.
//It also eases changes in the future since updates to response handling would only need to be made in one place
//rather than across numerous API route files.

import { NextResponse } from 'next/server'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import { NextApiRequest } from 'next'
//import {ShowErrorConfirmationDialog} from '@/components/ShowErrorConfimationDialog'

export interface ResultInfo {
  status: string // error or success
  message: string
  statusCode: string
  nextActionCode: string
  result: any
}

export function sendSuccessResponse(data: ResultInfo, httpStatusCode: number = HttpStatusCode.Ok) {
  return NextResponse.json(data, {
    status: httpStatusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

export function createSuccessResponse(message: string, result: any={}, appStatusCode: string="", nextActionCode: string="") {
  return {
    status: 'success',
    message,
    result,
    statusCode:appStatusCode,
    nextActionCode
  }
}

// Utility function to create error response object
export function createErrorResponse(message: string, result: any={}, appStatusCode: string = "", nextActionCode: string="") {
  return {
    status: 'error',
    message,
    result,
    statusCode:appStatusCode,
    nextActionCode
  }
}

// export const createServerResponse = (
//   status:string, //success / error
//   statusCode:string,
//   nextActionCode:string,
//   data:any) => {
//   return {
//     status,
//     result: {
//       statusCode,
//       nextActionCode,
//       data
//     }
//   };
// };

// utils/apiResponses.ts
export function sendErrorResponse(errorInfo: ResultInfo, httpStatusCode: number = HttpStatusCode.InternalServerError) {
  return NextResponse.json(
    errorInfo, {
    status: httpStatusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

// Utility function to navigate to a route
export const navigateToRoute = (route: string, router: any) => {
  //const navigateToRoute = useNavigateToRoute();
  router.push(route)
}

export async function readRequestBody(req: NextApiRequest) {
  const chunks = []
  for await (const chunk of req.body) {
    chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks)
  const bodyString = buffer.toString('utf-8')
  return JSON.parse(bodyString) // Parse the JSON string into an object
}

// Define error code mappings to error messages and actions
const errorMappings: any = {
  USER_ALREADY_EXISTS: {
    message: 'User with this email already exists',
    action: 'DISPLAY_ERROR'
  },
  INVALID_CREDENTIALS: {
    message: 'Invalid email or password',
    action: 'SHOW_LOGIN_FORM'
  }
  // Add more error codes and their mappings as needed
}

// Utility function to handle server errors
export const handleServerResponse = (status: string, result: any, router: any) => {
  if (status === 'error') {
    console.log('Result:', result)
    const errorMapping = errorMappings[result.result.statusCode]
    console.log('error mapping:', errorMapping)
    if (result) {
      // Perform action based on action code
      switch (result.result.nextActionCode) {
        case 'DISPLAY_ALERT':
          // Display error message to the user
          alert(errorMapping.message)
          break
        case 'DISPLAY_TOAST':
          // Display error message to the user
          alert(errorMapping.message)
          break
        case 'NAVIGATE_TO_PAGE':
          // Show login form to allow the user to enter credentials again
          showLoginForm()
          break
        case 'CONFIRM_TO_NAVIGATE_TO_PAGE':
          console.log('Error:', errorMapping.message)
          // ShowErrorConfirmationDialog(errorMapping.message,
          //   result.nextPage,navigateToRoute,router);
          break
        default:
          // Handle unknown action
          console.error('Unknown action:', errorMapping.action)
      }
    } else {
      // Default action for unknown error code
      alert('An unknown error occurred')
    }
  } //end of if(status==='error')
}

// Utility function to show a login form
export const showLoginForm = () => {
  // Logic to show the login form, for example:
  // Set a state variable to indicate that the login form should be displayed
}

// Utility function to load a component to view
export const loadComponent = (componentName: string) => {
  // Logic to load the specified component, for example using dynamic import:
  // import(`path/to/${componentName}`);
}

// Utility function to set context values in session
export const setSessionContext = (key: string, value: any) => {
  // Logic to set context values in session storage, for example:
  // sessionStorage.setItem(key, value);
}

// Utility function to show an alert dialog with error message and prompt to proceed
export const showAlertWithConfirmation = (errorMessage: string, nextPage: string) => {
  // Show alert dialog with error message and prompt to proceed
  const proceed = window.confirm(errorMessage + '\n\nDo you want to proceed to the next page?')
  if (proceed) {
    // Navigate to the next page if user chooses to proceed
    // navigateToRoute(nextPage);
  }
}

// Utility function to show an alert dialog with error message and prompt to proceed
export const showDialogWithConfirmation = (errorMessage: string, nextPage: string, router: any) => {
  // Show alert dialog with error message and prompt to proceed
  //ShowErrorConfirmationDialog(errorMessage,nextPage,navigateToRoute,router);
}
