import { connectToDB } from '../config/db.config.js';
import { logger, serverLogger } from '../middlewares/Logger.middleware.js';
const startServer = async (app) => {
    try {
        await connectToDB();
        const PORT = Number(process.env.PORT) || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            serverLogger(PORT);
        });
    }
    catch (error) {
        logger.error('Failed to start server:');
        logger.error(`${error}`);
        process.exit(1);
    }
};
export { startServer };
