import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CategoryService } from './category.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id as Types.ObjectId;
  const result = await CategoryService.createCategoryIntoDB(req.body, userId);

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Category created successfully',
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategoriesFromDB(
    req.query as Record<string, string>
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Categories retrieved successfully',
    data: result
  });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getSingleCategoryFromDB(req.params.id);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Category retrieved successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id as Types.ObjectId;
  const result = await CategoryService.updateCategoryIntoDB(
    req.params.id,
    req.body,
    userId
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteCategoryFromDB(req.params.id);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};