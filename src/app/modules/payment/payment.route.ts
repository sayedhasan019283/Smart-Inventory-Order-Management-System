import express from 'express'
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { paymentController } from './payment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { paymentValidation } from './payment.validation';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *         transactionId:
 *           type: string
 *         userId:
 *           type: string
 *
 *     CreatePaymentInput:
 *       type: object
 *       required:
 *         - amount
 *         - transactionId
 *       properties:
 *         amount:
 *           type: number
 *         transactionId:
 *           type: string
 */

/**
 * @swagger
 * /payment/create:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentInput'
 *     responses:
 *       200:
 *         description: Payment created successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    '/create',
    validateRequest(paymentValidation.paymentValidationSchema),
    auth(USER_ROLE.user),
    paymentController.createPayment
)

/**
 * @swagger
 * /payment/read-single/{paymentId}:
 *   get:
 *     summary: Get a single payment by ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single payment.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Payment not found.
 */
router.get(
    '/read-single/:paymentId',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst, USER_ROLE.user),
    paymentController.getSinglePayment
)

/**
 * @swagger
 * /payment/read-all:
 *   get:
 *     summary: Get all payments
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of payments.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    '/read-all',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst),
    paymentController.getAllPayment
)

/**
 * @swagger
 * /payment/read-single-under-user:
 *   get:
 *     summary: Get all payments for the current user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of payments for the current user.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    '/read-single-under-user',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.analyst, USER_ROLE.user),
    paymentController.getAllPaymentUnderUser
)


export const paymentRoute = router