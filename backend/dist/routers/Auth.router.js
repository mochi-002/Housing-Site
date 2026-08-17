import express from 'express';
import { register, login } from '../controllers/Auth.controller.js';
const router = express.Router();
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/register').post(register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/login').post(login);
export { router as authRouter };
