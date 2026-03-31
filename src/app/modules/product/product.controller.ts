
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ProductService } from "./product.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as {
    productImage?: Express.Multer.File[];
  };
  const userId = req.user?.id;
  if (!userId) {
    return next(new Error('User ID is missing in the request'));
  }
    const result = await ProductService.createProductIntoDB(req.body, files, userId);
    sendResponse(res, {
        code : StatusCodes.CREATED,
        message : 'Product created successfully',
        data : result
    });
})

const readAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ProductService.readAllProductsFromDB();
    sendResponse(res, {
        code : StatusCodes.OK,
        message : 'Products fetched successfully',
        data : result
    });
})

const readSingleProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ProductService.readSingleProductFromDB(id);
    sendResponse(res, {
        code : StatusCodes.OK,
        message : 'Product fetched successfully',
        data : result
    });
})

const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const files = req.files as {
        productImage?: Express.Multer.File[];
    };
    const result = await ProductService.updateProductIntoDB(id, req.body, files);
    sendResponse(res, {
        code : StatusCodes.OK,
        message : 'Product updated successfully',
        data : result
    });
})

const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await ProductService.deleteProductFromDB(id);
    sendResponse(res, {
        code : StatusCodes.OK,
        message : 'Product deleted successfully',
        data : result
    });
})


export const ProductController = {
    createProduct,
    readAllProducts,
    readSingleProduct,
    updateProduct,
    deleteProduct,
}
