import { NextRequest } from 'next/server'
import * as ApiResponseUtils from '@/utils/apiResponses'
import connectMongo from '@/utils/dbConnect-mongo'
import User from '@/app/models/user.model'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as UserService from '@/app/services/user.service'
import * as bcryptjs from 'bcryptjs'
//
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userResult = await UserService.getByEmail({ email: params.id })
    if (userResult.status === 'success') {
      const successResult = ApiResponseUtils.createSuccessResponse(
        `User ${params.id} has been found`,
        userResult?.result
      )

      return ApiResponseUtils.sendSuccessResponse(successResult)
    }
    var failResult = ApiResponseUtils.createErrorResponse(userResult.message || `User not found.`)
    return ApiResponseUtils.sendErrorResponse(failResult)
  } catch (error: any) {
    console.log('Error', error)
    const errorResp = ApiResponseUtils.createErrorResponse(error?.message || 'Unknown Error')
    return ApiResponseUtils.sendErrorResponse(errorResp)
  }
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo()
    const email = params.id
    // const isEmail = /\S+@\S+\.\S+/.test(params.id)
    // const query = isEmail ? { email: params.id } : { username: params.id }
    // const user = await User.findOne(query).select('-password')
    const user = await User.findOne({ email }).select('-password')
    if (user) {
      const updateData: any = await req.json()
      const updatedUser = await UserService.updateOne({ email, data: updateData })
      // if (updateData?.username) {
      //   user.username = updateData.username
      // }
      // if (updateData?.email) {
      //   user.email = updateData.email
      // }
      // Ensure password is hashed appropriately before saving
      // if (updateData?.password) {
      //   const hashedPassword = await bcryptjs.hash(updateData.password, 10)
      //   user.password = hashedPassword
      //   // Ensure password is hashed appropriately before saving
      // }
      // await user.save()
      if (updatedUser.status === 'success') {
        const successResult = ApiResponseUtils.createSuccessResponse(
          `User ${params.id} has been added`,
          updatedUser.result
        )
        return ApiResponseUtils.sendSuccessResponse(successResult)
      } else {
        const errorResponse = ApiResponseUtils.createErrorResponse(
          updatedUser.message || `User ${params.id} update failed.`
        )
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
    }
    const errorResponse = ApiResponseUtils.createErrorResponse(`User ${params.id} not found.`)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  } catch (error: any) {
    console.error('Error', error)
    const errorResp = ApiResponseUtils.createErrorResponse(error.message || 'Unknown Error')
    return ApiResponseUtils.sendErrorResponse(errorResp)
  }
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo()
    const user = await User.findById(params.id)
    if (user) {
      await User.findByIdAndDelete(user._id)
      const successResult = ApiResponseUtils.createSuccessResponse(`User ${params.id} has been deleted`)
      return ApiResponseUtils.sendSuccessResponse(successResult, HttpStatusCode.Ok)
    }
    const errorResult = ApiResponseUtils.createErrorResponse(`User ${params.id} not found`)
    return ApiResponseUtils.sendErrorResponse(errorResult, HttpStatusCode.NotFound)
  } catch (error) {
    console.error('Error', error)
    const errorResp = ApiResponseUtils.createErrorResponse('Unknown Error')

    return ApiResponseUtils.sendErrorResponse(errorResp, HttpStatusCode.InternalServerError)
  }
}
