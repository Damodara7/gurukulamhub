import * as GameService from './game.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function PUT(request) {
    try {
      const { id: gameId, playerId } = request.params;
      const updateData = await request.json();
  
      if (!gameId || !playerId) {
        return ApiResponseUtils.sendErrorResponse(
          'Missing game ID or player ID',
          HttpStatusCode.BadRequest
        );
      }
  
      const result = await GameService.updatePlayerProgress(
        gameId,
        playerId,
        updateData
      );
  
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