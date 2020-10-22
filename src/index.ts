import { hhmmss } from './hhmmss';
import { isObject } from './isObject';

type LoggerArgs = {
  namespace: string;
  color: string;
};


interface Logger {
  <T>(arg: T): T;
}

const consoleObj: Record<string, any> = console




const loggerCache: Record<string, Logger> = {};

const ALL_LEVELS = '*';

const rawLogLevel = process.env.PPRMNT_LOG || ALL_LEVELS;
const logLevel = rawLogLevel.split(',');



const getSecondsToday = (): number => {
  const now: Date = new Date();

  // create an object using the current day/month/year
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diff: number = now.valueOf() - today.valueOf(); // ms difference
  return Math.round(diff / 1000); // make seconds
};

const getTimeStamp = () => {
  const seconds = getSecondsToday();
  const formatted = hhmmss(seconds);
  return [`%c[${formatted}]`, 'color: cyan;'];
};

const getNameSpace = (namespace: string, color: string) => [
  `%c[${namespace}]`,
  `color: ${color}; font-weight: bold;`,
];

const logMessageLevels: Record<string,string> = {
  error: `color: red; font-weight: bold;`,
  info: `color: white;`,
  warn: `color: goldenrod;`,
};

const consoleMethods: Record<string,string> = {
  warn: 'warn',
  info: 'log',
  error: 'error',
  table: 'table',
};

/* eslint-disable no-console */


const buildLogger = ({ namespace, color }: LoggerArgs) => {
  const [timestampString, timestampStyle] = getTimeStamp();
  const [namespaceString, namespaceStyle] = getNameSpace(namespace, color);

  const isIncluded =
    logLevel.includes(ALL_LEVELS) || logLevel.includes(namespace);

  // return noop if not included in loglevel
  if (!isIncluded) return () => {};



  const log = (message: string, logLevel: string = 'info'): Logger => {
    const logMessageStyle = logMessageLevels[logLevel];
    const logMessageString = `%c${message}`;
    let method: string = consoleMethods[logLevel];
    let logString = [
      `${timestampString}${namespaceString} ${logMessageString}`,
    ];
    let logStyles = [timestampStyle, namespaceStyle, logMessageStyle];

    if (isObject(message)) {
      method = consoleMethods.table;
      logString = [`${timestampString}${namespaceString} %c`, ...logStyles];
      logStyles = [message];
    }

    if (logLevel === 'error') {
      const err: Error = <Error><unknown>message
      console.error(err);
      console.trace(err.stack);
      message = JSON.stringify(err);
    }

    const logFn = consoleObj[method];
    logFn(...logString, ...logStyles);
  };
  loggerCache[namespace] = log;
  return log;
};

const timerCache = {};

export const timer = id => {
  const start = () => {
    const crumbs = [];
    const stamp = new Date().valueOf();
    const elapsedTime = 0;
    const crumb = { name: 'start', stamp, elapsedTime, totalTime: 0 };
    crumbs.push(crumb);
    timerCache[id] = crumbs;
  };

  const crumb = name: string => {
    const crumbs = timerCache[id];
    const stamp = new Date().valueOf();
    const { stamp: start } = crumbs[0];
    const { stamp: prev } = crumbs[crumbs.length - 1];
    const elapsedTime = stamp - prev;
    const totalTime = stamp - start;
    const crumb = { name, stamp, elapsedTime, totalTime };
    crumbs.push(crumb);
  };

  const stop = () => {
    const crumbs = timerCache[id];
    const stamp = new Date().valueOf();
    const { stamp: start } = crumbs[0];
    const { stamp: prev } = crumbs[crumbs.length - 1];
    const elapsedTime = stamp - prev;
    const totalTime = stamp - start;
    const crumb = { name: 'end', stamp, elapsedTime, totalTime };
    crumbs.push(crumb);
    console.table(crumbs);
    return totalTime;
  };
  return { start, crumb, stop };
};

/* eslint-enable no-console */

export const logger = (namespace, color) => {
  if (loggerCache[namespace]) return loggerCache[namespace];
  return buildLogger({ namespace, color });
};

export default logger;
