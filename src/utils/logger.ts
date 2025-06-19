import pino from 'pino';

const loggerInstance = pino({
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'SYS:standard',
			ignore: 'pid,hostname',
		},
	},
});

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
