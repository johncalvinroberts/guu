import Guu, { LoggerFactory, Logger, TimerFactory } from '../src';
import { delay } from '../src/utils';

describe('guu', () => {
  describe('Logger', () => {
    it('initializes', () => {
      const logger = new Guu('test', '#3e3240');
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(LoggerFactory);
      expect(logger.instance).toBeInstanceOf(Logger);
    });

    it('uses the cached namespace version', () => {
      const logger = new Guu('test', '#3e3240');
      const logger2 = new Guu('test', '#3e3240');
      expect(logger2).toBeDefined();
      expect(logger).toBeDefined();
    });
    it('logs', async () => {
      const spy = jest.spyOn(LoggerFactory.prototype, 'log');
      const logger = new Guu('test', '#3e3240');
      logger.log('Hey');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('TimerFactory', () => {
    it('initializes', () => {
      const myTimer = new TimerFactory('test');
      expect(myTimer.id).toBe('test');
      expect(myTimer).toBeDefined();
      expect(myTimer.crumb).toBeInstanceOf(Function);
      expect(myTimer.start).toBeInstanceOf(Function);
      expect(myTimer.stop).toBeInstanceOf(Function);
    });

    it('starts', async () => {
      const myTimer = new TimerFactory('test2');
      const spy = jest.spyOn(console, 'table');
      myTimer.start();
      await delay(1000);
      myTimer.crumb('delayed 1000ms');
      expect(myTimer.id).toBe('test2');
      // @ts-ignore
      expect(myTimer.instance.crumbs.length).toBe(2);
      myTimer.stop();
      expect(spy).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(myTimer.instance.crumbs.length).toBe(3);
    });
    it('stops', async () => {
      const myTimer = new TimerFactory('test3');
      myTimer.start();
      await delay(1000);
      myTimer.crumb('delayed 1000ms');
      const time = myTimer.stop();
      // @ts-ignore
      expect(myTimer.instance.crumbs.length).toBe(3);
      expect(time).toBeGreaterThanOrEqual(1);
    });
  });
});
