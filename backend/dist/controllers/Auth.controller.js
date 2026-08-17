import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model.js';
import { validateLogin, validateRegister } from '../validators/User.validate.js';
import { sendError, sendSuccess } from '../utils/response.util.js';
/**
 * @description Register New User
 * @route /auth/register
 * @method POST
 * @access public
 */
const register = asyncHandler(async (req, res) => {
    // 1. Validate request payload
    const { error } = validateRegister(req.body);
    if (error) {
        sendError(res, {
            message: error.details?.[0]?.message ?? 'Validation Failed',
            statusCode: 400,
        });
        return;
    }
    // 2. Extract user data
    const { fullName, email, password } = req.body;
    // 3. Ensure user doesn't already exist
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        sendError(res, {
            message: 'User not found, Invalid email or password',
        });
        return;
    }
    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 5. Create user
    const user = new User({
        fullName,
        email,
        password: hashedPassword,
        role: 'Seeker',
    });
    // 6. Save user
    await user.save();
    // 7. Generate JWT
    const token = user.generateAuthToken();
    // 8. Remove password from response
    const userObject = user.toObject();
    const { password: _password, ...other } = userObject;
    // 9. Send response
    sendSuccess(res, {
        message: 'User registered successfully',
        data: { user: other, token },
        statusCode: 201,
    });
});
/**
 * @description User Login
 * @route /auth/login
 * @method POST
 * @access public
 */
const login = asyncHandler(async (req, res) => {
    // 1. Validate request payload against login validation schema
    const { error } = validateLogin(req.body);
    if (error) {
        sendError(res, {
            message: error.details?.[0]?.message ?? 'Validation Failed',
            statusCode: 400,
        });
        return;
    }
    const { email, password } = req.body;
    // 2. Fetch target user by email address
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        sendError(res, {
            message: 'User not found, Invalid email or password',
        });
        return;
    }
    // 3. Verify plain text password against stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordMatch) {
        sendError(res, {
            message: 'Invalid email or password',
        });
        return;
    }
    // 4. Gen JWT and Omit sensitive password field before sending user document back
    const token = existingUser.generateAuthToken();
    const userObject = existingUser.toObject();
    const { password: _password, ...other } = userObject;
    // 5. Send 200 OK response containing sanitized user details
    sendSuccess(res, {
        message: 'User logged in successfully',
        data: { user: other, token },
        statusCode: 200,
    });
});
export { register, login };
