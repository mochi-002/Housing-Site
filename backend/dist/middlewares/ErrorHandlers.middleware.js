import mongoose from 'mongoose';
export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
};
export const errorHandler = (err, req, res, next) => {
    res.status(500).json({
        success: false,
        message: 'Something went wrong, please try again later',
    });
};
export const validateId = (id, res) => {
    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({
            message: 'Invalid post ID',
        });
        return false;
    }
    return true;
};
