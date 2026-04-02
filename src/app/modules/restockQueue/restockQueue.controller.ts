import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { RestockQueueService } from './restockQueue.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getRestockQueue = catchAsync(async (req: Request, res: Response) => {
  const result = await RestockQueueService.getRestockQueueFromDB(
    req.query as Record<string, string>,
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Restock queue retrieved successfully',
    data: result,
  });
});

const getSingleQueueEntry = catchAsync(async (req: Request, res: Response) => {
  const result = await RestockQueueService.getSingleQueueEntryFromDB(
    req.params.id,
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Restock queue entry retrieved successfully',
    data: result,
  });
});

const manualRestock = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as Types.ObjectId;
  const result = await RestockQueueService.manualRestockIntoDB(
    req.params.id,
    req.body,
    userId,
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Product restocked successfully',
    data: result,
  });
});

const removeFromQueue = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as Types.ObjectId;
  const result = await RestockQueueService.removeFromQueueDB(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Removed from restock queue',
    data: result,
  });
});

export const RestockQueueController = {
  getRestockQueue,
  getSingleQueueEntry,
  manualRestock,
  removeFromQueue,
};
