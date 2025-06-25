import winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

const loggerInstance = winston.createLogger({
	level: isDev ? 'debug' : 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		// isDev ? winston.format.colorize() : winston.format.uncolorize(),
		winston.format.colorize(),
		winston.format.printf(({ timestamp, level, message, ...meta }) => {
			const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
			return `${timestamp} [${level}]: ${message} ${metaString}`;
		})
	),
	transports: [new winston.transports.Console()],
});

const logger = {
	info: (msg: any, meta?: any) => {
		if (meta !== undefined) {
			loggerInstance.info(msg, meta);
		} else {
			loggerInstance.info(msg);
		}
	},
	warn: (msg: any, meta?: any) => {
		if (meta !== undefined) {
			loggerInstance.warn(msg, meta);
		} else {
			loggerInstance.warn(msg);
		}
	},
	error: (msg: any, meta?: any) => {
		if (meta !== undefined) {
			loggerInstance.error(msg, meta);
		} else {
			loggerInstance.error(msg);
		}
	},
	debug: (msg: any, meta?: any) => {
		if (meta !== undefined) {
			loggerInstance.debug(msg, meta);
		} else {
			loggerInstance.debug(msg);
		}
	},
	raw: loggerInstance,
};

export default logger;
