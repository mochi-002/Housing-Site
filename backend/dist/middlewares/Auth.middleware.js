import jwt from 'jsonwebtoken';
import 'dotenv/config';
/**
 * @description Verifies the JWT sent in the Authorization header
 *               and attaches the decoded payload to req.user
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            message: 'No token provided',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            message: 'Invalid token format',
        });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({
            message: 'JWT secret is not configured',
        });
        return;
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
}
export default verifyToken;
