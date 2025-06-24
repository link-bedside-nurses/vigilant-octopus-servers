import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production' && !process.env.PM2_HOME;

const loggerInstance = isDev
	? pino({
			transport: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:standard',
					ignore: 'pid,hostname',
				},
			},
		})
	: pino(); // plain JSON logs for PM2/production

const logger = {
	info: (msg: any, meta?: any) => {
		if (meta !== undefined) {
			loggerInstance.info(meta, msg);
		} else if (typeof msg === 'object') {
			loggerInstance.info({ ...msg });
		} else {
			loggerInstance.info(msg);
		}
	},
	warn: (msg: any, meta?: any) => {
		if (meta !== undefined) {
			loggerInstance.warn(meta, msg);
		} else if (typeof msg === 'object') {
			loggerInstance.warn({ ...msg });
		} else {
			loggerInstance.warn(msg);
		}
	},
	error: (msg: any, meta?: any) => {
		if (meta !== undefined) {
			loggerInstance.error(meta, msg);
		} else if (typeof msg === 'object') {
			loggerInstance.error({ ...msg });
		} else {
			loggerInstance.error(msg);
		}
	},
	debug: (msg: any, meta?: any) => {
		if (meta !== undefined) {
			loggerInstance.debug(meta, msg);
		} else if (typeof msg === 'object') {
			loggerInstance.debug({ ...msg });
		} else {
			loggerInstance.debug(msg);
		}
	},
	raw: loggerInstance,
};

export default logger;
