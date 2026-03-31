import express from 'express';
import { ProductController } from './product.controller';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import convertHeicToPngMiddleware from '../../middlewares/convertHeicToPngMiddleware';
import validateRequest from '../../middlewares/validateRequest';
import { createProductValidation, updateProductValidation } from './product.validation';

const UPLOADS_FOLDER = 'uploads/users';
const upload = fileUploadHandler(UPLOADS_FOLDER);

const router = express.Router();

router.post(
    '/create-product',
    upload.fields([
      {
      name: "productImage",
      maxCount: 1
    },
    ]),
    convertHeicToPngMiddleware(UPLOADS_FOLDER),
    auth("admin", "user"),
    validateRequest(createProductValidation),
     ProductController.createProduct
    );


    router.get(
        '/products',
        auth("admin", "user"),
        ProductController.readAllProducts
    );

    router.get(
        '/products/:id',
        auth("admin", "user"),
        ProductController.readSingleProduct
    );

    router.put(
        '/products/:id',
        upload.fields([
      {
      name: "productImage",
      maxCount: 1
    },
    ]),
    convertHeicToPngMiddleware(UPLOADS_FOLDER),
        auth("admin", "user"),
        validateRequest(updateProductValidation),
        ProductController.updateProduct
    );

    router.delete(
        '/products/:id',
        auth("admin", "user"),
        ProductController.deleteProduct
    );

export const ProductRoute = router;