type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
	[key: string]: unknown;
}

function formatTimestamp(): string {
	return new Date().toISOString();
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
	const timestamp = formatTimestamp();
	const contextStr = context ? ` ${JSON.stringify(context)}` : '';
	return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
	info: (message: string, context?: LogContext) => {
		console.log(formatLog('info', message, context));
	},
	warn: (message: string, context?: LogContext) => {
		console.warn(formatLog('warn', message, context));
	},
	error: (message: string, error?: Error | unknown, context?: LogContext) => {
		const errorContext = {
			...(error instanceof Error
				? { error: error.message, stack: error.stack, name: error.name }
				: { error: String(error) }),
			...context
		};
		console.error(formatLog('error', message, errorContext));
	},
	debug: (message: string, context?: LogContext) => {
		if (process.env.NODE_ENV !== 'production') {
			console.debug(formatLog('debug', message, context));
		}
	}
};
