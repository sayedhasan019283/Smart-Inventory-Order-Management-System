import { Request, Response } from 'express';
import { ActivityLogService } from './activityLog.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const getActivityLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityLogService.getActivityLogsFromDB(
    req.query as Record<string, string>
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Activity logs retrieved successfully',
    data: result,
  });
});

export const ActivityLogController = {
  getActivityLogs,
};