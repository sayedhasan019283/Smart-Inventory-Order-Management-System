import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import convertHeicToPngMiddleware from '../../middlewares/convertHeicToPngMiddleware';
import { USER_ROLE } from './user.constant';

const UPLOADS_FOLDER = 'uploads/users';
const upload = fileUploadHandler(UPLOADS_FOLDER);

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and profile endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         Designation:
 *           type: string
 *         profileImage:
 *           type: string
 *         CV:
 *           type: string
 *
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - firstName
 *         - email
 *         - phoneNumber
 *         - Designation
 *         - password
 *         - ConfirmPassword
 *       properties:
 *         firstName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phoneNumber:
 *           type: string
 *         Designation:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *         ConfirmPassword:
 *           type: string
 *           format: password
 *         profileImage:
 *           type: string
 *           format: binary
 *         CV:
 *           type: string
 *           format: binary
 */

/**
 * @swagger
 * /users/create-user:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       200:
 *         description: User created successfully or OTP sent for verification.
 *       400:
 *         description: Bad request, e.g., user already exists.
 */
router
  .route('/create-user')
  .post(
    upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    ]),
    convertHeicToPngMiddleware(UPLOADS_FOLDER),
    validateRequest(UserValidation.createUserValidationSchema),
    UserController.createUser
  );

/**
 * @swagger
 * /users/create-admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       200:
 *         description: Admin created successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
  router.post(
    '/create-admin',
    upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount:1
    },
    ]),
    auth(USER_ROLE.superAdmin),
    UserController.createAdmin
  )

/**
 * @swagger
 * /users/create-analyst:
 *   post:
 *     summary: Create a new analyst
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       200:
 *         description: Analyst created successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
  router.post(
    '/create-analyst',
    upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount:1
    },
    ]),
    auth(USER_ROLE.superAdmin),
    UserController.createAnalyst
  )

/**
 * @swagger
 * /users/create-manual-user:
 *   post:
 *     summary: Create a new user manually
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       200:
 *         description: User created successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
  router.post(
    '/create-manual-user',
    upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    },
    {
      name: "CV",
      maxCount:1
    },
    ]),
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    UserController.createManualUser
  )

/**
 * @swagger
 * /users/profile-image:
 *   post:
 *     summary: Update user profile image
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image updated successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  '/profile-image',
  upload.single('profileImage'),
  convertHeicToPngMiddleware(UPLOADS_FOLDER),
  UserController.updateUserImage
);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get my profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 */
router.get(
  '/profile',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
   UserController.getMyProfile
  );

/**
 * @swagger
 * /users/profile-update:
 *   patch:
 *     summary: Update my profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               CV:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       401:
 *         description: Unauthorized.
 */
router.patch(
  '/profile-update',
  auth(USER_ROLE.user),
  // validateRequest(UserValidation.updateUserValidationSchema),
  upload.fields([
      {
      name: "profileImage",
      maxCount: 1
    }
    ]),
  convertHeicToPngMiddleware(UPLOADS_FOLDER),
  UserController.updateMyProfile
);

/**
 * @swagger
 * /users/get-one-users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
router.get(
  '/get-one-users/:id',
  auth('admin'),
  UserController.getSingleUserFromDB
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *   delete:
 *     summary: Delete my profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       401:
 *         description: Unauthorized.
 */
router
  .route('/')
  .get( auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst) ,UserController.getAllUsers)
  .delete( UserController.deleteMyProfile);

/**
 * @swagger
 * /users/single-user/{id}:
 *   get:
 *     summary: Get a single user by ID (public)
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       404:
 *         description: User not found.
 */
router.get(
  '/single-user/:id',
  UserController.getSingleUserById
)

/**
 * @swagger
 * /users/search-user/{Uid}:
 *   get:
 *     summary: Search for a user by their unique User ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: Uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
router.get(
  '/search-user/:Uid',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserController.searchByUid
)
export const UserRoutes = router;
