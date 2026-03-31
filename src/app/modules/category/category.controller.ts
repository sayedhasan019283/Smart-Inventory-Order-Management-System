import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { CategoryService } from "./category.service";
import sendResponse from "../../../shared/sendResponse";
import status from "http-status";
import { StatusCodes } from "http-status-codes";

const createCategory = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const payload = req.body;
    const result = await CategoryService.createCategoryIntoDB(payload);
    sendResponse(res, {
        code: StatusCodes.CREATED,
        message: 'Category created successfully',
        data: result,
    });
}) 

const getAllCategories = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const result = await CategoryService.getAllCategoriesFromDB();
    sendResponse(res, { 
        code: StatusCodes.OK,
        message: 'Categories retrieved successfully',
        data: result,
    });
})

const getSingleCategory = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const { id } = req.params;
    const result = await CategoryService.getSingleCategoryFromDB(id);
    sendResponse(res, { 
        code: StatusCodes.OK,
        message: 'Category retrieved successfully',
        data: result,
    });
})

const updateCategory = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await CategoryService.updateCategoryFromDB(id, payload);
    sendResponse(res, { 
        code: StatusCodes.OK,
        message: 'Category updated successfully',
        data: result,
    });
})

const deleteCategory = catchAsync(async (req : Request, res : Response, next : NextFunction) => {
    const { id } = req.params;
    const result = await CategoryService.deleteCategoryFromDB(id);
    sendResponse(res, { 
        code: StatusCodes.OK,
        message: 'Category deleted successfully',
        data: result,
    });
})


export const CategoryController = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory
}