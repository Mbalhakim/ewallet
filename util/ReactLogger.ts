import { logger, consoleTransport } from 'react-native-logs';

const defaultConfig = {
  levels: {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5
  },
  transport: consoleTransport,
  transportOptions: {
    colors: {
      trace: 'grey',
      debug: 'blue',
      info: 'green',
      warn: 'yellow',
      error: 'red',
      fatal: 'magenta'
    }
  },
  dateFormat: 'time'
};

// Create the logger with the configuration
const log = logger.createLogger(defaultConfig);

export default log;
