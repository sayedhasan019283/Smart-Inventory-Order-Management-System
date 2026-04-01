import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { DashboardService } from './dashboard.service';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getDashboardStatsFromDB();

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  });
});

const getDashboardAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getDashboardAnalyticsFromDB();

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Dashboard analytics retrieved successfully',
    data: result,
  });
});

export const DashboardController = {
  getDashboardStats,
  getDashboardAnalytics,
};