import guu from '../src';

describe('guu', () => {
  it('builds logger', () => {
    const logger = guu('test', '#3e3240');
    logger('test');
  });
});
