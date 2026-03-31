import { TCategory } from "./category.interface";
import CategoryModel from "./category.model";

const createCategoryIntoDB = async (payload : TCategory) => {
    const result = await CategoryModel.create(payload);
    return result;
}

const getAllCategoriesFromDB = async () => {
    const result = await CategoryModel.find();
    return result;
}
const getSingleCategoryFromDB = async (id : string) => {
    const result = await CategoryModel.findById(id);
    return result;
}

const updateCategoryFromDB = async (id : string, payload : TCategory) => {
    const result = await CategoryModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
}

const deleteCategoryFromDB = async (id : string) => {
    const result = await CategoryModel.findByIdAndDelete(id);
    return result;
}

export const CategoryService = {
    createCategoryIntoDB,
    getAllCategoriesFromDB,
    getSingleCategoryFromDB,
    updateCategoryFromDB,
    deleteCategoryFromDB,
}