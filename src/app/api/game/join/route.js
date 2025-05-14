import * as GameService from './game.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function POST(request) {
    try {
      const { gameId, user } = await request.json();
  
      if (!gameId || !user?._id || !user?.email) {
        return ApiResponseUtils.sendErrorResponse(
          'Missing required fields: gameId, user ID, or email',
          HttpStatusCode.BadRequest
        );
      }
  
      const result = await GameService.joinGame(gameId, {
        user: { _id: user._id },
        email: user.email
      });
  
      if (result.status === 'success') {
        return ApiResponseUtils.sendSuccessResponse(result.message, result.result);
      }
      return ApiResponseUtils.sendErrorResponse(
        result.message,
        HttpStatusCode.BadRequest
      );
  
    } catch (error) {
      return ApiResponseUtils.sendErrorResponse(
        error.message,
        HttpStatusCode.InternalServerError
      );
    }
  }