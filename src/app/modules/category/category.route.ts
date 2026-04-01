import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import {
  createCategoryValidation,
  updateCategoryValidation,
} from './category.validation';

const router = express.Router();

router.post(
  '/create-category',
  auth('admin', 'user'),
  validateRequest(createCategoryValidation),
  CategoryController.createCategory
);

router.get(
  '/get-all-categories',
  auth('admin', 'user'),
  CategoryController.getAllCategories
);

router.get(
  '/get-single-category/:id',
  auth('admin', 'user'),
  CategoryController.getSingleCategory
);

router.patch(
  '/update-category/:id',
  auth('admin', 'user'),
  validateRequest(updateCategoryValidation),
  CategoryController.updateCategory
);

router.delete(
  '/delete-category/:id',
  auth('admin'),
  CategoryController.deleteCategory
);

export const CategoryRoute = router;