import { getTimeStamp, isObject } from './utils';

/**
 * types
 */
type Interface<T> = {
  [P in keyof T]: T[P];
};

enum ConsoleMethodEnum {
  warn = 'warn',
  info = 'log',
  log = 'log',
  error = 'error',
  table = 'table',
  trace = 'trace',
  debug = 'debug',
}

type Message = string[] | unknown[];
interface Crumb {
  name: string;
  stamp: number;
  elapsedTime: number;
  totalTime: number;
}

const consoleObj: Record<ConsoleMethodEnum, any> = console;
const loggerCache: Record<string, Logger> = {};
const timerCache: Record<string, any> = {};

/**
 * constants
 */
const ALL_LEVELS = '*';
const NAMESPACE_LEVEL =
  process?.env?.GUU_LOG_NAMESPACES?.split(',') ?? ALL_LEVELS;
const LOG_LEVEL = process?.env?.GUU_LOG_LEVELS?.split(',') || ALL_LEVELS;

const LOG_ALL: boolean = LOG_LEVEL.includes(ALL_LEVELS);

const getNameSpace = (namespace: string, color: string): string[] => [
  `%c[${namespace}]`,
  `color: ${color}; font-weight: bold;`,
];

const LOG_LEVEL_STYLES = {
  error: `color: red; font-weight: bold;`,
  info: `color: white;`,
  warn: `color: goldenrod;`,
};

/**
 * Timer util
 */
class Timer {
  id: string;
  private crumbs: Crumb[];
  constructor(id: string) {
    this.id = id;
    this.crumbs = [];
  }

  public start = () => {
    this.crumbs = [];
    const stamp = new Date().valueOf();
    const elapsedTime = 0;
    const crumb: Crumb = { name: 'start', stamp, elapsedTime, totalTime: 0 };
    this.crumbs.push(crumb);
  };

  public crumb = (name: string) => {
    const crumbs = this.crumbs;
    const stamp = new Date().valueOf();
    const { stamp: start } = crumbs[0];
    const { stamp: prev } = crumbs[crumbs.length - 1];
    const elapsedTime = stamp - prev;
    const totalTime = stamp - start;
    const crumb = { name, stamp, elapsedTime, totalTime };
    crumbs.push(crumb);
  };

  public stop = () => {
    const crumbs = this.crumbs;
    const stamp = new Date().valueOf();
    const { stamp: start } = crumbs[0];
    const { stamp: prev } = crumbs[crumbs.length - 1];
    const elapsedTime = stamp - prev;
    const totalTime = stamp - start;
    const crumb: Crumb = { name: 'end', stamp, elapsedTime, totalTime };
    crumbs.push(crumb);
    console.table(crumbs);
    return totalTime;
  };
}

export class TimerFactory implements Interface<Timer> {
  id: string;
  instance: Timer;

  constructor(id: string) {
    this.id = id;
    if (timerCache[id]) {
      this.instance = timerCache[id];
    } else {
      this.instance = new Timer(id);
      timerCache[id] = this.instance;
    }
  }
  start = () => this.instance.start();
  stop = () => this.instance.stop();
  crumb = (name: string) => this.instance.crumb(name);
}

export class Logger {
  private namespaceStyle: string;
  private namespaceString: string;
  constructor(namespace: string, color: string) {
    const [namespaceString, namespaceStyle] = getNameSpace(namespace, color);
    this.namespaceString = namespaceString;
    this.namespaceStyle = namespaceStyle;
  }

  private buildLogString(message: string, timestampString: string): string[] {
    const logMessageString = `%c${message}`;
    return [`${timestampString}${this.namespaceString} ${logMessageString}`];
  }

  private buildLogStyles(timestampStyle: string): string[] {
    return [timestampStyle, this.namespaceStyle];
  }

  private executeLog(
    message: Message,
    method: ConsoleMethodEnum,
    logLevelStyles?: string
  ) {
    let [mainMessage, ...appendage] = message;
    if (isObject(mainMessage)) {
      appendage = mainMessage as unknown[];
      mainMessage = '';
    }
    const [timestampString, timestampStyle] = getTimeStamp();
    const logString = this.buildLogString(
      mainMessage as string,
      timestampString
    );
    const logStyles = [
      ...this.buildLogStyles(timestampStyle),
      logLevelStyles || '',
    ];
    const logFn = consoleObj[method];
    logFn(...logString, ...logStyles, ...appendage);
  }

  public log(message: Message) {
    return this.executeLog(message, ConsoleMethodEnum.log);
  }

  public error(message: Message) {
    return this.executeLog(
      message,
      ConsoleMethodEnum.log,
      LOG_LEVEL_STYLES.error
    );
  }

  public warn(message: Message) {
    return this.executeLog(
      message,
      ConsoleMethodEnum.log,
      LOG_LEVEL_STYLES.warn
    );
  }

  public info(message: Message) {
    return this.executeLog(
      message,
      ConsoleMethodEnum.log,
      LOG_LEVEL_STYLES.info
    );
  }

  public trace(message: Message) {
    return this.executeLog(message, ConsoleMethodEnum.trace);
  }

  public debug(message: Message) {
    return this.executeLog(message, ConsoleMethodEnum.debug);
  }

  public table(message: Message) {
    return this.executeLog(message, ConsoleMethodEnum.table);
  }
}

class DecoyLogger implements Interface<Logger> {
  table() {}
  debug() {}
  log() {}
  info() {}
  warn() {}
  error() {}
  trace() {}
}

export class LoggerFactory implements Interface<Logger> {
  instance: Logger | DecoyLogger;
  isSilent: boolean;
  constructor(namespace: string, color: string) {
    const isSilent =
      !NAMESPACE_LEVEL.includes(ALL_LEVELS) &&
      !NAMESPACE_LEVEL.includes(namespace);
    let instance: Logger | DecoyLogger = loggerCache[namespace];

    if (!instance && !isSilent) {
      instance = new Logger(namespace, color);
      loggerCache[namespace] = instance;
    }

    if (isSilent) {
      instance = new DecoyLogger();
    }
    this.isSilent = isSilent;
    this.instance = instance;
  }

  log(...args: Message) {
    if (!LOG_LEVEL.includes(ConsoleMethodEnum.log) && !LOG_ALL) {
      return;
    }
    return this.instance.log(args);
  }
  trace(...args: Message) {
    if (!LOG_LEVEL.includes(ConsoleMethodEnum.trace) && !LOG_ALL) {
      return;
    }
    return this.instance.trace(args);
  }
  error(...args: Message) {
    if (!LOG_LEVEL.includes(ConsoleMethodEnum.error) && !LOG_ALL) {
      return;
    }
    return this.instance.error(args);
  }
  info(...args: Message) {
    if (!LOG_LEVEL.includes(ConsoleMethodEnum.info) && !LOG_ALL) {
      return;
    }
    return this.instance.info(args);
  }
  warn(...args: Message) {
    if (!LOG_LEVEL.includes(ConsoleMethodEnum.warn) && !LOG_ALL) {
      return;
    }
    return this.instance.warn(args);
  }
  debug(...args: Message) {
    if (!LOG_LEVEL.includes(ConsoleMethodEnum.debug) && !LOG_ALL) {
      return;
    }
    return this.instance.debug(args);
  }
  table(...args: Message) {
    if (!LOG_LEVEL.includes(ConsoleMethodEnum.table) && !LOG_ALL) {
      return;
    }
    return this.instance.table(args);
  }
}

export default LoggerFactory;
