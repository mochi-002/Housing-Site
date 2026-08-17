import chalk from 'chalk';
function durationColor(time) {
    if (time >= 1000)
        return chalk.red;
    if (time >= 500)
        return chalk.yellow;
    return chalk.green;
}
export const logger = {
    info(message) {
        console.log(`${chalk.blue('INFO')} ${message}`);
    },
    success(message) {
        console.log(`${chalk.green('SUCCESS')} ${message}`);
    },
    warn(message) {
        console.log(`${chalk.yellow('WARN')} ${message}`);
    },
    error(message) {
        console.log(`${chalk.red('ERROR')} ${message}`);
    },
    request(timestamp, method, originalUrl, statusCode) {
        console.log(`${chalk.bgCyan.black('   REQ   ')} [${chalk.grey(timestamp)}] ${method} ${chalk.magenta(originalUrl)} ${statusCode}`);
    },
    separator() {
        console.log(chalk.gray('─'.repeat(50)));
    },
    time(time) {
        console.log(`${chalk.bgBlack.white(' Done In ')} ` +
            `${durationColor(time).bold(`${time}ms`)}`);
    },
};
export function requestsLogger(req, res, next) {
    const start = Date.now();
    const timestamp = new Date().toISOString().replace('T', ' - ').slice(0, -5);
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.separator();
        logger.request(timestamp, req.method, req.originalUrl, res.statusCode);
        logger.time(duration);
    });
    next();
}
export function serverLogger(PORT) {
    logger.separator();
    logger.separator();
    logger.info('Server is running');
    logger.info(`Port: ${PORT}`);
    logger.info(`URL: http://localhost:${PORT}`);
    logger.separator();
}
