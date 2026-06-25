type LogMeta = Record<string, unknown> | undefined;

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const formatMeta = (meta: LogMeta) => {
  if (!meta) return '';
  try {
    return JSON.stringify(meta, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  } catch {
    return '[meta no serializable]';
  }
};

const formatMessage = (level: LogLevel, tag: string, message: string, meta?: LogMeta) => {
  const timestamp = new Date().toISOString();
  const metaString = formatMeta(meta);
  return `${timestamp} ${level} [${tag}] ${message}${metaString ? ` | meta=${metaString}` : ''}`;
};

const getErrorPayload = (error: unknown) => {
  if (!error) return { message: 'Unknown error' };
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
  return { message: typeof error === 'string' ? error : JSON.stringify(error) };
};

const log = (level: LogLevel, tag: string, message: string, meta?: LogMeta) => {
  const formatted = formatMessage(level, tag, message, meta);
  switch (level) {
    case 'DEBUG':
      console.debug(formatted);
      break;
    case 'INFO':
      console.info(formatted);
      break;
    case 'WARN':
      console.warn(formatted);
      break;
    case 'ERROR':
      console.error(formatted);
      break;
    default:
      console.log(formatted);
  }
};

export const logger = {
  debug: (tag: string, message: string, meta?: LogMeta) => log('DEBUG', tag, message, meta),
  info: (tag: string, message: string, meta?: LogMeta) => log('INFO', tag, message, meta),
  warn: (tag: string, message: string, meta?: LogMeta) => log('WARN', tag, message, meta),
  error: (tag: string, error: unknown, meta?: LogMeta) => {
    const payload = getErrorPayload(error);
    log('ERROR', tag, payload.message ?? 'Error', { ...meta, stack: (payload as any).stack, name: (payload as any).name });
  },
};
