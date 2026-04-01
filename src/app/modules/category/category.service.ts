import { Types } from 'mongoose';
import CategoryModel from './category.model';
import { TCreateCategory, TUpdateCategory } from './category.validation';
import AppError from '../../../errors/AppError';
import { createActivityLog } from '../activityLog/activityLog.service';

const createCategoryIntoDB = async (
  payload: TCreateCategory,
  userId: Types.ObjectId
) => {
  const existing = await CategoryModel.findOne({ name: payload.name });
  if (existing) {
    throw new AppError(400, 'Category with this name already exists');
  }

  const category = await CategoryModel.create({
    ...payload,
    createdBy: userId,
  });

  await createActivityLog({
    action: 'CATEGORY_CREATED',
    description: `Category "${category.name}" created`,
    performedBy: userId,
    refModel: 'Category',
    refId: category._id as Types.ObjectId,
  });

  return category;
};

const getAllCategoriesFromDB = async (query: {
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const filter: Record<string, unknown> = { isActive: true };

  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    CategoryModel.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CategoryModel.countDocuments(filter),
  ]);

  return {
    categories,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getSingleCategoryFromDB = async (id: string) => {
  const category = await CategoryModel.findById(id).populate(
    'createdBy',
    'name email'
  );
  if (!category) throw new AppError(404, 'Category not found');
  return category;
};

const updateCategoryIntoDB = async (
  id: string,
  payload: TUpdateCategory,
  userId: Types.ObjectId
) => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new AppError(404, 'Category not found');

  // duplicate name check — নিজেকে বাদ দিয়ে
  if (payload.name && payload.name !== category.name) {
    const existing = await CategoryModel.findOne({
      name: payload.name,
      _id: { $ne: id },
    });
    if (existing) {
      throw new AppError(400, 'Category with this name already exists');
    }
  }

  const updated = await CategoryModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );

  return updated;
};

const deleteCategoryFromDB = async (id: string) => {
  const category = await CategoryModel.findById(id);
  if (!category) throw new AppError(404, 'Category not found');

  // soft delete — isActive false করো
  await CategoryModel.findByIdAndUpdate(id, { isActive: false });

  return { message: 'Category deleted successfully' };
};

export const CategoryService = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
};