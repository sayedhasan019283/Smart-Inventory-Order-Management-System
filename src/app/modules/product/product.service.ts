import { Types } from 'mongoose';
import { IProduct } from "./product.interface";
import ProductModel from "./product.model";

const createProductIntoDB = async (
    payload: Partial<IProduct>,
    files: { productImage?: Express.Multer.File[] },
    userId: Types.ObjectId  
) => {
    if (files?.productImage?.[0]) {
        payload.productImage = `/uploads/users/${files.productImage[0].filename}`;
    }

    if (!payload.createdBy) {
        payload.createdBy = userId;
    }

    const newProduct = await ProductModel.create(payload);
    return newProduct;
};

const readAllProductsFromDB = async () => {
    const products = await ProductModel.find().populate('category', 'name');
    return products;
}

const readSingleProductFromDB = async (productId: string) => {
    const product = await ProductModel.findById(productId).populate('category', 'name');
    return product;
}   

const updateProductIntoDB = async (productId: string, payload: Partial<IProduct>, files: { productImage?: Express.Multer.File[] }) => {
    if (files?.productImage?.[0]) {
        payload.productImage = `/uploads/users/${files.productImage[0].filename}`;
    }   
    const updatedProduct = await ProductModel.findByIdAndUpdate(productId, payload, { new: true }).populate('category', 'name');
    return updatedProduct;
}

const deleteProductFromDB = async (productId: string) => {
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    return deletedProduct;
}   

export const ProductService = {
    createProductIntoDB,
    readAllProductsFromDB,
    readSingleProductFromDB,
    updateProductIntoDB,
    deleteProductFromDB
};