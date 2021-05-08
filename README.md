# guu
[![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://npm.im/tsdx) 
[![Node version](https://img.shields.io/node/v/guu.svg?style=flat)](http://nodejs.org/download/)
[![npm version](https://badge.fury.io/js/guu.svg)](https://badge.fury.io/js/guu)
[![Minified bundle size](https://badgen.net/bundlephobia/min/guu)](https://www.npmjs.com/package/guu)
[![gzipped bundle size](https://badgen.net/bundlephobia/minzip/guu)](https://www.npmjs.com/package/guu)



Tiny browser logger. Better than `debug`.

## Features
* Pretty ✨ console logs
* `namespace` support
* Log levels
* Timer util for profiling things in your code
  
## Quick Start

```sh
yarn add guu
```

Each time you instantiate `guu`, you can specify the namespace and a color.

```js
import guu from 'guu'

const log = new guu('main', '#3e3240');
log.info('hello world');
// prints pretty log
```


You can also use different console methods, in a sense supporting "log levels" like a typical logger.

```js

try {
  log.warn('There\'s gonna be an error');
  throw new Error('Somethin broke.');
} catch {
  log.error(error);
}

```

## Log Levels

* `info`
* `warn`
* `debug`
* `error`
* `trace`

## Timer Util

`guu` also has a built i timer util, for profiling things in your code.

```js
import { TimerFactory } from 'guu';

const {start, stop, crumb} = new TimerFactory('Some Process');

start();
doSomethingHeavy();
crumb('did something heavy');
doSomethingHeavier();
crumb('did something heavier');
stop();
// prints profile of how long each operation took
```

## Log Levels

`guu` looks for two environment variables during bundle time
* `GUU_LOG_NAMESPACES` - defaults to `*`, functions as a comma-seperated "allow list" when present. Example: `router,utils`
* `GUU_LOG_LEVELS` - defaults to `*`, functions as a comma-seperated "allow list" when present. Example: `error,debug`