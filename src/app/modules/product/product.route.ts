import express from 'express';
import auth from '../../middlewares/auth';
import convertHeicToPngMiddleware from '../../middlewares/convertHeicToPngMiddleware';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './product.controller';
import {
  createProductValidation,
  restockProductValidation,
  updateProductValidation,
} from './product.validation';

const UPLOADS_FOLDER = 'uploads/users';
const upload = fileUploadHandler(UPLOADS_FOLDER);

const router = express.Router();

// create
router.post(
  '/create-product',
  upload.fields([{ name: 'productImage', maxCount: 1 }]),
  convertHeicToPngMiddleware(UPLOADS_FOLDER),
  auth('admin', 'user'),
  validateRequest(createProductValidation),
  ProductController.createProduct
);

// read all — ?category=&status=&search=&page=&limit=&sortBy=
router.get(
  '/products',
  auth('admin', 'user'),
  ProductController.readAllProducts
);

// read single
router.get(
  '/products/:id',
  auth('admin', 'user'),
  ProductController.readSingleProduct
);

// update
router.put(
  '/products/:id',
  upload.fields([{ name: 'productImage', maxCount: 1 }]),
  convertHeicToPngMiddleware(UPLOADS_FOLDER),
  auth('admin', 'user'),
  validateRequest(updateProductValidation),
  ProductController.updateProduct
);

// manual restock — requirement অনুযায়ী
router.patch(
  '/products/:id/restock',
  auth('admin', 'user'),
  validateRequest(restockProductValidation),
  ProductController.restockProduct
);

// delete
router.delete(
  '/products/:id',
  auth('admin', 'user'),
  ProductController.deleteProduct
);

export const ProductRoute = router;