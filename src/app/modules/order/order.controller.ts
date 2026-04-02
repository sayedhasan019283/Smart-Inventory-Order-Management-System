import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { OrderService } from './order.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as Types.ObjectId;
  const result = await OrderService.createOrderIntoDB(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Order created successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrdersFromDB(
    req.query as Record<string, string>,
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Orders retrieved successfully',
    data: result.orders,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getSingleOrderFromDB(req.params.id);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Order retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as Types.ObjectId;
  const result = await OrderService.updateOrderStatusIntoDB(
    req.params.id,
    req.body,
    userId,
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Order status updated successfully',
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as Types.ObjectId;
  const result = await OrderService.deleteOrderFromDB(req.params.id, userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Order deleted successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
};
