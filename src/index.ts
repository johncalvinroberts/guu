import { getTimeStamp, isObject } from './utils';

const consoleObj: Record<ConsoleMethodEnum, any> = console;
const loggerCache: Record<string, Logger> = {};
const timerCache: Record<string, any> = {};

const ALL_LEVELS = '*';
const rawLogLevel = process?.env?.GUU_LOG_LEVEL || ALL_LEVELS;
const logLevel = rawLogLevel.split(',');

const getNameSpace = (namespace: string, color: string): string[] => [
  `%c[${namespace}]`,
  `color: ${color}; font-weight: bold;`,
];

const LOG_LEVEL_STYLES = {
  error: `color: red; font-weight: bold;`,
  info: `color: white;`,
  warn: `color: goldenrod;`,
};

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
}

type Message = string[] | unknown[];
interface Crumb {
  name: string;
  stamp: number;
  elapsedTime: number;
  totalTime: number;
}
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
  private isSilent: boolean;
  constructor(namespace: string, color: string) {
    const [namespaceString, namespaceStyle] = getNameSpace(namespace, color);
    this.namespaceString = namespaceString;
    this.namespaceStyle = namespaceStyle;
    this.isSilent =
      logLevel.includes(ALL_LEVELS) || logLevel.includes(namespace);
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
    if (this.isSilent) {
      return;
    }
    return this.executeLog(message, ConsoleMethodEnum.log);
  }

  public error(message: Message) {
    if (this.isSilent) {
      return;
    }
    return this.executeLog(
      message,
      ConsoleMethodEnum.log,
      LOG_LEVEL_STYLES.error
    );
  }

  public warn(message: Message) {
    if (this.isSilent) {
      return;
    }
    return this.executeLog(
      message,
      ConsoleMethodEnum.log,
      LOG_LEVEL_STYLES.warn
    );
  }

  public info(message: Message) {
    if (this.isSilent) {
      return;
    }
    return this.executeLog(
      message,
      ConsoleMethodEnum.log,
      LOG_LEVEL_STYLES.info
    );
  }

  public trace(message: Message) {
    if (this.isSilent) {
      return;
    }
    return this.executeLog(message, ConsoleMethodEnum.trace);
  }

  public table(message: Message) {
    return this.executeLog(message, ConsoleMethodEnum.table);
  }
}

export class LoggerFactory implements Interface<Logger> {
  instance: Logger;

  constructor(namespace: string, color: string) {
    if (loggerCache[namespace]) {
      this.instance = loggerCache[namespace];
    } else {
      this.instance = new Logger(namespace, color);
      loggerCache[namespace] = this.instance;
    }
  }

  log(args: Message) {
    return this.instance.log(args);
  }
  trace(args: Message) {
    return this.instance.trace(args);
  }
  error(args: Message) {
    return this.instance.error(args);
  }
  info(args: Message) {
    return this.instance.info(args);
  }
  warn(args: Message) {
    return this.instance.warn(args);
  }
  table(args: Message) {
    return this.instance.table(args);
  }
}

export default LoggerFactory;
