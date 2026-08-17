function sendSuccess(res, { message, data, statusCode = 200 }) {
    res.status(statusCode).json({
        success: true,
        message,
        ...(data !== undefined && { data }),
    });
}
function sendError(res, { message, statusCode = 400, errors }) {
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors !== undefined && { errors }),
    });
}
export { sendSuccess, sendError };
